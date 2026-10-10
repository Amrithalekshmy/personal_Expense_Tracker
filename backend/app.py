# app.py — Flask REST API for the Personal Expense Tracker
#
# Every request runs hand-written SQL against PostgreSQL (tables in ../schema.sql).
# The React frontend calls these endpoints under /api; the logged-in user's id is
# kept in a signed session cookie, and every query is filtered by that user_id.
#
# Run:  python app.py        (listens on http://localhost:5000)

import csv
import io
import os
from datetime import date
from decimal import Decimal
from functools import wraps

import psycopg
from psycopg.rows import dict_row
from flask import Flask, Response, jsonify, request, session
from flask.json.provider import DefaultJSONProvider
from werkzeug.security import check_password_hash, generate_password_hash

# libpq connection string; the default connects to the local database over the
# Unix socket as the current OS user. Override with e.g.
#   DATABASE_URL="postgresql://postgres:password@localhost:5432/expense_tracker"
DATABASE_URL = os.environ.get("DATABASE_URL", "dbname=expense_tracker")

TYPES = ("Income", "Expense")
PAYMENT_METHODS = ("Cash", "UPI", "Credit Card", "Debit Card", "Net Banking")

# Categories given to every new account (the examples listed in Phase 3)
DEFAULT_CATEGORIES = [
    ("Food", "Expense"), ("Transport", "Expense"), ("Shopping", "Expense"),
    ("Utilities", "Expense"), ("Entertainment", "Expense"), ("Healthcare", "Expense"),
    ("Education", "Expense"), ("Others", "Expense"), ("Salary", "Income"),
]


class JSONProvider(DefaultJSONProvider):
    """Send NUMERIC columns as numbers and DATE columns as YYYY-MM-DD."""

    @staticmethod
    def default(o):
        if isinstance(o, Decimal):
            return float(o)
        if isinstance(o, date):
            return o.isoformat()
        return DefaultJSONProvider.default(o)


app = Flask(__name__)
app.json = JSONProvider(app)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")


def db():
    """Open a connection; `with db() as conn:` commits on success, rolls back on error."""
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


class ApiError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.message = message
        self.status = status


@app.errorhandler(ApiError)
def handle_api_error(e):
    return jsonify(error=e.message), e.status


# Constraint violations raised by PostgreSQL become readable API errors
@app.errorhandler(psycopg.errors.UniqueViolation)
def handle_unique(e):
    messages = {
        "users_email_key": "An account with this email already exists.",
        "uq_category_name_type": "You already have a category with this name and type.",
        "uq_budget_category_month": "A budget for this category and month already exists.",
    }
    return jsonify(error=messages.get(e.diag.constraint_name, "Duplicate value.")), 409


@app.errorhandler(psycopg.errors.ForeignKeyViolation)
def handle_fk(e):
    if e.diag.constraint_name == "fk_transaction_category_owner":
        return jsonify(error="This category still has transactions. Delete or move them first."), 409
    return jsonify(error="Referenced record does not exist."), 400


@app.errorhandler(psycopg.errors.CheckViolation)
def handle_check(e):
    return jsonify(error=f"Invalid value ({e.diag.constraint_name})."), 400


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify(error="Not logged in."), 401
        return view(*args, **kwargs)
    return wrapper


def body():
    return request.get_json(silent=True) or {}


def required(data, *fields):
    missing = [f for f in fields if data.get(f) in (None, "")]
    if missing:
        raise ApiError(f"Missing field(s): {', '.join(missing)}")


def month_year():
    """?month=&year= query params, defaulting to the current month."""
    today = date.today()
    try:
        return int(request.args.get("month", today.month)), int(request.args.get("year", today.year))
    except ValueError:
        raise ApiError("month and year must be numbers")


def check_category_type(conn, user_id, category_id, txn_type):
    """A transaction's type must match its category's type (Income/Expense)."""
    row = conn.execute(
        "SELECT category_type FROM categories WHERE category_id = %s AND user_id = %s",
        (category_id, user_id),
    ).fetchone()
    if row is None:
        raise ApiError("Category not found.", 404)
    if row["category_type"] != txn_type:
        raise ApiError(f"This category is for {row['category_type']} transactions.")


# ── Auth ───────────────────────────────────────────────────

@app.post("/api/auth/register")
def register():
    data = body()
    required(data, "name", "email", "password")
    if len(data["password"]) < 8:
        raise ApiError("Password must be at least 8 characters.")

    with db() as conn:
        user = conn.execute(
            """INSERT INTO users (name, email, password_hash)
               VALUES (%s, %s, %s)
               RETURNING user_id, name, email""",
            (data["name"].strip(), data["email"].strip().lower(),
             generate_password_hash(data["password"])),
        ).fetchone()
        conn.cursor().executemany(
            "INSERT INTO categories (user_id, category_name, category_type) VALUES (%s, %s, %s)",
            [(user["user_id"], name, ctype) for name, ctype in DEFAULT_CATEGORIES],
        )

    session["user_id"] = user["user_id"]
    return jsonify(user), 201


@app.post("/api/auth/login")
def login():
    data = body()
    required(data, "email", "password")
    with db() as conn:
        user = conn.execute(
            "SELECT user_id, name, email, password_hash FROM users WHERE email = %s",
            (data["email"].strip().lower(),),
        ).fetchone()

    if user is None or not check_password_hash(user["password_hash"], data["password"]):
        raise ApiError("Incorrect email or password.", 401)

    session["user_id"] = user["user_id"]
    del user["password_hash"]
    return jsonify(user)


@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@app.get("/api/auth/me")
@login_required
def me():
    with db() as conn:
        user = conn.execute(
            "SELECT user_id, name, email FROM users WHERE user_id = %s",
            (session["user_id"],),
        ).fetchone()
    if user is None:
        session.clear()
        return jsonify(error="Not logged in."), 401
    return jsonify(user)


# ── Profile ────────────────────────────────────────────────

@app.get("/api/profile")
@login_required
def get_profile():
    uid = session["user_id"]
    with db() as conn:
        user = conn.execute(
            """SELECT user_id, name, email, phone, location, created_at::date AS joined
               FROM users WHERE user_id = %s""",
            (uid,),
        ).fetchone()
        stats = conn.execute(
            """SELECT
                   (SELECT COUNT(*) FROM transactions WHERE user_id = %(uid)s) AS transactions,
                   (SELECT COUNT(*) FROM categories   WHERE user_id = %(uid)s) AS categories,
                   (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = %(uid)s) AS tracked""",
            {"uid": uid},
        ).fetchone()
    return jsonify(user=user, stats=stats)


@app.put("/api/profile")
@login_required
def update_profile():
    data = body()
    required(data, "name", "email")
    with db() as conn:
        user = conn.execute(
            """UPDATE users
               SET name = %s, email = %s, phone = %s, location = %s
               WHERE user_id = %s
               RETURNING user_id, name, email, phone, location, created_at::date AS joined""",
            (data["name"].strip(), data["email"].strip().lower(),
             data.get("phone") or None, data.get("location") or None, session["user_id"]),
        ).fetchone()
    return jsonify(user)


@app.put("/api/profile/password")
@login_required
def change_password():
    data = body()
    required(data, "current", "next")
    if len(data["next"]) < 8:
        raise ApiError("New password must be at least 8 characters.")
    with db() as conn:
        row = conn.execute(
            "SELECT password_hash FROM users WHERE user_id = %s", (session["user_id"],)
        ).fetchone()
        if not check_password_hash(row["password_hash"], data["current"]):
            raise ApiError("Current password is incorrect.", 403)
        conn.execute(
            "UPDATE users SET password_hash = %s WHERE user_id = %s",
            (generate_password_hash(data["next"]), session["user_id"]),
        )
    return jsonify(ok=True)


# ── Categories ─────────────────────────────────────────────

@app.get("/api/categories")
@login_required
def list_categories():
    month, year = month_year()
    with db() as conn:
        rows = conn.execute(
            """SELECT c.category_id, c.category_name, c.category_type,
                      COALESCE(SUM(t.amount), 0) AS spent,
                      b.budget_amount
               FROM categories c
               LEFT JOIN transactions t
                      ON t.category_id = c.category_id
                     AND EXTRACT(MONTH FROM t.transaction_date) = %(month)s
                     AND EXTRACT(YEAR  FROM t.transaction_date) = %(year)s
               LEFT JOIN budgets b
                      ON b.category_id = c.category_id
                     AND b.month = %(month)s AND b.year = %(year)s
               WHERE c.user_id = %(uid)s
               GROUP BY c.category_id, b.budget_amount
               ORDER BY c.category_type DESC, c.category_name""",
            {"uid": session["user_id"], "month": month, "year": year},
        ).fetchall()
    return jsonify(rows)


@app.post("/api/categories")
@login_required
def create_category():
    data = body()
    required(data, "category_name", "category_type")
    with db() as conn:
        row = conn.execute(
            """INSERT INTO categories (user_id, category_name, category_type)
               VALUES (%s, %s, %s)
               RETURNING category_id, category_name, category_type""",
            (session["user_id"], data["category_name"].strip(), data["category_type"]),
        ).fetchone()
    return jsonify(row), 201


@app.put("/api/categories/<int:category_id>")
@login_required
def update_category(category_id):
    data = body()
    required(data, "category_name", "category_type")
    with db() as conn:
        used = conn.execute(
            """SELECT 1 FROM transactions
               WHERE category_id = %s AND user_id = %s AND transaction_type <> %s
               LIMIT 1""",
            (category_id, session["user_id"], data["category_type"]),
        ).fetchone()
        if used:
            raise ApiError("Can't change the type: this category has transactions of the other type.")
        row = conn.execute(
            """UPDATE categories SET category_name = %s, category_type = %s
               WHERE category_id = %s AND user_id = %s
               RETURNING category_id, category_name, category_type""",
            (data["category_name"].strip(), data["category_type"], category_id, session["user_id"]),
        ).fetchone()
    if row is None:
        raise ApiError("Category not found.", 404)
    return jsonify(row)


@app.delete("/api/categories/<int:category_id>")
@login_required
def delete_category(category_id):
    with db() as conn:
        deleted = conn.execute(
            "DELETE FROM categories WHERE category_id = %s AND user_id = %s",
            (category_id, session["user_id"]),
        ).rowcount
    if not deleted:
        raise ApiError("Category not found.", 404)
    return jsonify(ok=True)


# ── Transactions ───────────────────────────────────────────

TXN_COLUMNS = """t.transaction_id, t.transaction_date, t.description, t.amount,
                 t.transaction_type, t.payment_method, t.category_id, c.category_name"""


def txn_fields(data):
    required(data, "category_id", "amount", "transaction_type", "payment_method", "transaction_date")
    if data["transaction_type"] not in TYPES:
        raise ApiError("Type must be Income or Expense.")
    if data["payment_method"] not in PAYMENT_METHODS:
        raise ApiError("Unknown payment method.")
    try:
        amount = Decimal(str(data["amount"]))
    except Exception:
        raise ApiError("Amount must be a number.")
    if amount <= 0:
        raise ApiError("Amount must be greater than 0.")
    return (int(data["category_id"]), data["transaction_date"], data.get("description") or None,
            amount, data["transaction_type"], data["payment_method"])


@app.get("/api/transactions")
@login_required
def list_transactions():
    # Filters from the Transactions page are applied in the WHERE clause
    conditions = ["t.user_id = %(uid)s"]
    params = {"uid": session["user_id"]}
    args = request.args
    if args.get("search"):
        conditions.append("t.description ILIKE %(search)s")
        params["search"] = f"%{args['search']}%"
    if args.get("category_id"):
        conditions.append("t.category_id = %(category_id)s")
        params["category_id"] = int(args["category_id"])
    if args.get("type"):
        conditions.append("t.transaction_type = %(type)s")
        params["type"] = args["type"]
    if args.get("date"):
        conditions.append("t.transaction_date = %(date)s")
        params["date"] = args["date"]

    limit = ""
    if args.get("limit"):
        limit = "LIMIT %(limit)s"
        params["limit"] = int(args["limit"])

    with db() as conn:
        rows = conn.execute(
            f"""SELECT {TXN_COLUMNS}
                FROM transactions t
                JOIN categories c ON c.category_id = t.category_id
                WHERE {' AND '.join(conditions)}
                ORDER BY t.transaction_date DESC, t.transaction_id DESC
                {limit}""",
            params,
        ).fetchall()
        total = conn.execute(
            "SELECT COUNT(*) AS n FROM transactions WHERE user_id = %s", (session["user_id"],)
        ).fetchone()["n"]
    return jsonify(transactions=rows, total=total)


@app.post("/api/transactions")
@login_required
def create_transaction():
    fields = txn_fields(body())
    uid = session["user_id"]
    with db() as conn:
        check_category_type(conn, uid, fields[0], fields[4])
        row = conn.execute(
            """INSERT INTO transactions
                   (user_id, category_id, transaction_date, description, amount,
                    transaction_type, payment_method)
               VALUES (%s, %s, %s, %s, %s, %s, %s)
               RETURNING transaction_id""",
            (uid, *fields),
        ).fetchone()
    return jsonify(row), 201


@app.put("/api/transactions/<int:transaction_id>")
@login_required
def update_transaction(transaction_id):
    fields = txn_fields(body())
    uid = session["user_id"]
    with db() as conn:
        check_category_type(conn, uid, fields[0], fields[4])
        updated = conn.execute(
            """UPDATE transactions
               SET category_id = %s, transaction_date = %s, description = %s, amount = %s,
                   transaction_type = %s, payment_method = %s
               WHERE transaction_id = %s AND user_id = %s""",
            (*fields, transaction_id, uid),
        ).rowcount
    if not updated:
        raise ApiError("Transaction not found.", 404)
    return jsonify(ok=True)


@app.delete("/api/transactions/<int:transaction_id>")
@login_required
def delete_transaction(transaction_id):
    with db() as conn:
        deleted = conn.execute(
            "DELETE FROM transactions WHERE transaction_id = %s AND user_id = %s",
            (transaction_id, session["user_id"]),
        ).rowcount
    if not deleted:
        raise ApiError("Transaction not found.", 404)
    return jsonify(ok=True)


@app.delete("/api/transactions")
@login_required
def delete_all_transactions():
    with db() as conn:
        deleted = conn.execute(
            "DELETE FROM transactions WHERE user_id = %s", (session["user_id"],)
        ).rowcount
    return jsonify(deleted=deleted)


@app.get("/api/transactions/export")
@login_required
def export_transactions():
    with db() as conn:
        rows = conn.execute(
            f"""SELECT {TXN_COLUMNS}
                FROM transactions t
                JOIN categories c ON c.category_id = t.category_id
                WHERE t.user_id = %s
                ORDER BY t.transaction_date DESC""",
            (session["user_id"],),
        ).fetchall()

    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(["Date", "Description", "Category", "Type", "Payment Method", "Amount"])
    for r in rows:
        writer.writerow([r["transaction_date"], r["description"] or "", r["category_name"],
                         r["transaction_type"], r["payment_method"], r["amount"]])
    return Response(out.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=transactions.csv"})


# ── Budgets ────────────────────────────────────────────────

@app.get("/api/budgets")
@login_required
def list_budgets():
    month, year = month_year()
    with db() as conn:
        rows = conn.execute(
            """SELECT b.budget_id, b.category_id, c.category_name, b.month, b.year,
                      b.budget_amount,
                      COALESCE(SUM(t.amount), 0) AS spent
               FROM budgets b
               JOIN categories c ON c.category_id = b.category_id
               LEFT JOIN transactions t
                      ON t.category_id = b.category_id
                     AND t.transaction_type = 'Expense'
                     AND EXTRACT(MONTH FROM t.transaction_date) = b.month
                     AND EXTRACT(YEAR  FROM t.transaction_date) = b.year
               WHERE b.user_id = %(uid)s AND b.month = %(month)s AND b.year = %(year)s
               GROUP BY b.budget_id, c.category_name
               ORDER BY c.category_name""",
            {"uid": session["user_id"], "month": month, "year": year},
        ).fetchall()
    return jsonify(rows)


def budget_amount(data):
    try:
        amount = Decimal(str(data["budget_amount"]))
    except Exception:
        raise ApiError("Budget must be a number.")
    if amount <= 0:
        raise ApiError("Budget must be greater than 0.")
    return amount


@app.post("/api/budgets")
@login_required
def create_budget():
    data = body()
    required(data, "category_id", "budget_amount", "month", "year")
    with db() as conn:
        row = conn.execute(
            """INSERT INTO budgets (user_id, category_id, month, year, budget_amount)
               VALUES (%s, %s, %s, %s, %s)
               RETURNING budget_id""",
            (session["user_id"], int(data["category_id"]), int(data["month"]),
             int(data["year"]), budget_amount(data)),
        ).fetchone()
    return jsonify(row), 201


@app.put("/api/budgets/<int:budget_id>")
@login_required
def update_budget(budget_id):
    data = body()
    required(data, "category_id", "budget_amount")
    with db() as conn:
        updated = conn.execute(
            """UPDATE budgets SET category_id = %s, budget_amount = %s
               WHERE budget_id = %s AND user_id = %s""",
            (int(data["category_id"]), budget_amount(data), budget_id, session["user_id"]),
        ).rowcount
    if not updated:
        raise ApiError("Budget not found.", 404)
    return jsonify(ok=True)


@app.delete("/api/budgets/<int:budget_id>")
@login_required
def delete_budget(budget_id):
    with db() as conn:
        deleted = conn.execute(
            "DELETE FROM budgets WHERE budget_id = %s AND user_id = %s",
            (budget_id, session["user_id"]),
        ).rowcount
    if not deleted:
        raise ApiError("Budget not found.", 404)
    return jsonify(ok=True)


# ── Dashboard & Reports (aggregate queries, nothing stored) ──

def monthly_trend(conn, uid, month, year):
    """Income and expense totals for the 6 months ending at month/year."""
    return conn.execute(
        """SELECT TO_CHAR(m.month_start, 'Mon') AS month,
                  COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'Income'), 0)  AS income,
                  COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type = 'Expense'), 0) AS expense
           FROM generate_series(
                    make_date(%(year)s, %(month)s, 1) - INTERVAL '5 months',
                    make_date(%(year)s, %(month)s, 1),
                    INTERVAL '1 month') AS m(month_start)
           LEFT JOIN transactions t
                  ON t.user_id = %(uid)s
                 AND DATE_TRUNC('month', t.transaction_date) = m.month_start
           GROUP BY m.month_start
           ORDER BY m.month_start""",
        {"uid": uid, "month": month, "year": year},
    ).fetchall()


def category_spend(conn, uid, month, year):
    """Expense total per category for one month."""
    return conn.execute(
        """SELECT c.category_name AS name, SUM(t.amount) AS spent
           FROM transactions t
           JOIN categories c ON c.category_id = t.category_id
           WHERE t.user_id = %(uid)s
             AND t.transaction_type = 'Expense'
             AND EXTRACT(MONTH FROM t.transaction_date) = %(month)s
             AND EXTRACT(YEAR  FROM t.transaction_date) = %(year)s
           GROUP BY c.category_name
           ORDER BY spent DESC""",
        {"uid": uid, "month": month, "year": year},
    ).fetchall()


@app.get("/api/dashboard")
@login_required
def dashboard():
    uid = session["user_id"]
    month, year = month_year()
    params = {"uid": uid, "month": month, "year": year}
    with db() as conn:
        summary = conn.execute(
            """SELECT
                   COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE -amount END), 0) AS balance,
                   COALESCE(SUM(amount) FILTER (
                       WHERE transaction_type = 'Income'
                         AND EXTRACT(MONTH FROM transaction_date) = %(month)s
                         AND EXTRACT(YEAR  FROM transaction_date) = %(year)s), 0) AS income,
                   COALESCE(SUM(amount) FILTER (
                       WHERE transaction_type = 'Expense'
                         AND EXTRACT(MONTH FROM transaction_date) = %(month)s
                         AND EXTRACT(YEAR  FROM transaction_date) = %(year)s), 0) AS expense
               FROM transactions
               WHERE user_id = %(uid)s""",
            params,
        ).fetchone()
        budget = conn.execute(
            """SELECT COALESCE(SUM(b.budget_amount), 0) AS budget,
                      COALESCE(SUM(s.spent), 0) AS budget_spent
               FROM budgets b
               LEFT JOIN (
                   SELECT category_id, SUM(amount) AS spent
                   FROM transactions
                   WHERE user_id = %(uid)s
                     AND transaction_type = 'Expense'
                     AND EXTRACT(MONTH FROM transaction_date) = %(month)s
                     AND EXTRACT(YEAR  FROM transaction_date) = %(year)s
                   GROUP BY category_id
               ) s ON s.category_id = b.category_id
               WHERE b.user_id = %(uid)s AND b.month = %(month)s AND b.year = %(year)s""",
            params,
        ).fetchone()
        recent = conn.execute(
            f"""SELECT {TXN_COLUMNS}
                FROM transactions t
                JOIN categories c ON c.category_id = t.category_id
                WHERE t.user_id = %s
                ORDER BY t.transaction_date DESC, t.transaction_id DESC
                LIMIT 5""",
            (uid,),
        ).fetchall()
        name = conn.execute("SELECT name FROM users WHERE user_id = %s", (uid,)).fetchone()["name"]

        return jsonify(
            name=name,
            summary={**summary, **budget},
            recent=recent,
            category_spend=category_spend(conn, uid, month, year),
            monthly=monthly_trend(conn, uid, month, year),
        )


@app.get("/api/reports")
@login_required
def reports():
    uid = session["user_id"]
    month, year = month_year()
    with db() as conn:
        count = conn.execute(
            """SELECT COUNT(*) AS n FROM transactions
               WHERE user_id = %s
                 AND EXTRACT(MONTH FROM transaction_date) = %s
                 AND EXTRACT(YEAR  FROM transaction_date) = %s""",
            (uid, month, year),
        ).fetchone()["n"]
        return jsonify(
            transaction_count=count,
            category_spend=category_spend(conn, uid, month, year),
            monthly=monthly_trend(conn, uid, month, year),
        )


if __name__ == "__main__":
    app.run(port=5000, debug=True)
