# Personal Expense Tracker

23CSE202 Database Management Systems — Group D16

A web app for recording income and expenses, organising them into categories,
setting monthly budgets and viewing reports. The database design follows the
Phase 3 Database Design Document (`PHASE 3.pdf`).

| Layer    | Technology                     | Where              |
|----------|--------------------------------|--------------------|
| Frontend | React + Vite                   | `src/`             |
| Backend  | Python + Flask (REST API)      | `backend/app.py`   |
| Database | PostgreSQL                     | `schema.sql`       |

```
Browser (React)  ──fetch /api/...──▶  Flask (backend/app.py)  ──SQL──▶  PostgreSQL
```

All SQL is written by hand in `backend/app.py` (no ORM). Every query is
filtered by the logged-in user's `user_id`.

## Setup (once)

### 1. PostgreSQL

Arch Linux:

```bash
sudo pacman -S postgresql
sudo -iu postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql
sudo -iu postgres createuser --createdb "$USER"
createdb expense_tracker
psql -d expense_tracker -f schema.sql
```

Windows / other: install PostgreSQL, create a database `expense_tracker`, run
`schema.sql` in it (pgAdmin or `psql`), and set `DATABASE_URL` (see below).

> Running `schema.sql` again drops and recreates the tables (all data is lost).

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt        # Windows: .venv\Scripts\pip
```

By default the backend connects to the local database `expense_tracker` as your
OS user. To use a username/password instead:

```bash
export DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/expense_tracker"
```

### 3. Frontend

```bash
npm install
```

## Run

Two terminals:

```bash
# Terminal 1 — API on http://localhost:5000
backend/.venv/bin/python backend/app.py

# Terminal 2 — website on http://localhost:5173
npm run dev
```

Open http://localhost:5173, click **Get Started / Register**, create an account
and start adding transactions.

## Database

Tables (see `schema.sql`): `users`, `categories`, `transactions`, `budgets`.

- `transactions` and `budgets` reference `categories` through the composite
  foreign key `(user_id, category_id)`, so a user can only use their own categories.
- `budgets` has `UNIQUE (user_id, category_id, month, year)`: one budget per
  category per month (Phase 3 business rule).
- `CHECK` constraints enforce `amount > 0`, type `Income`/`Expense`, valid
  payment methods and month 1–12.
- The Dashboard and Reports are not stored. They are computed with aggregate
  queries (`SUM`, `GROUP BY`, `FILTER`, `generate_series`) in `backend/app.py`.

## API

| Method | Endpoint                         | Purpose                              |
|--------|----------------------------------|--------------------------------------|
| POST   | `/api/auth/register`             | Create account (+ default categories)|
| POST   | `/api/auth/login`                | Log in                               |
| POST   | `/api/auth/logout`               | Log out                              |
| GET    | `/api/auth/me`                   | Current user                         |
| GET/PUT| `/api/profile`                   | View / edit profile                  |
| PUT    | `/api/profile/password`          | Change password                      |
| GET/POST | `/api/categories`              | List (with month totals) / add       |
| PUT/DELETE | `/api/categories/<id>`       | Edit / delete                        |
| GET/POST/DELETE | `/api/transactions`     | List with filters / add / delete all |
| PUT/DELETE | `/api/transactions/<id>`     | Edit / delete                        |
| GET    | `/api/transactions/export`       | Download CSV                         |
| GET/POST | `/api/budgets?month=&year=`    | List with amount spent / add         |
| PUT/DELETE | `/api/budgets/<id>`          | Edit / delete                        |
| GET    | `/api/dashboard`                 | Dashboard summary                    |
| GET    | `/api/reports?month=&year=`      | Report for a month                   |
