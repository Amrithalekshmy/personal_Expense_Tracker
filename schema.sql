
-- 1. Create USER table
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create CATEGORY table
CREATE TABLE categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(10) NOT NULL
        CHECK (category_type IN ('Income', 'Expense')),
    description TEXT,

    CONSTRAINT fk_category_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- Supports composite foreign keys from other tables
    CONSTRAINT uq_category_owner
        UNIQUE (user_id, category_id),

    -- Avoid duplicate category names of the same type per user
    CONSTRAINT uq_category_name_type
        UNIQUE (user_id, category_name, category_type)
);

-- 3. Create TRANSACTION table
CREATE TABLE transactions (
    transaction_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(10) NOT NULL
        CHECK (transaction_type IN ('Income', 'Expense')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES categories(user_id, category_id),

    CONSTRAINT chk_transaction_category_type
        CHECK (transaction_type IN ('Income', 'Expense'))
);

-- 4. Create BUDGET table
CREATE TABLE budgets (
    budget_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    budget_amount NUMERIC(12, 2) NOT NULL
        CHECK (budget_amount > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_budget_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES categories(user_id, category_id),

    CONSTRAINT chk_budget_dates
        CHECK (start_date <= end_date)
);

-- 5. Create indexes for commonly queried foreign keys
CREATE INDEX idx_transactions_user_date
    ON transactions(user_id, transaction_date);

CREATE INDEX idx_transactions_category
    ON transactions(category_id);

CREATE INDEX idx_budgets_user_period
    ON budgets(user_id, start_date, end_date);

CREATE INDEX idx_categories_user
    ON categories(user_id);
