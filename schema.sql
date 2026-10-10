-- Personal Expense Tracker — PostgreSQL schema
-- Matches the Phase 3 Database Design Document (Group D16):
--   USER(user_id PK, name, email UNIQUE, password_hash, phone, location)
--   CATEGORY(category_id PK, user_id FK, name, type)
--   TRANSACTION(transaction_id PK, user_id FK, category_id FK, transaction_date,
--               description, amount, type, payment_method)
--   BUDGET(budget_id PK, user_id FK, category_id FK, month, year, budget_amount,
--          UNIQUE(user_id, category_id, month, year))

DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Create USER table
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create CATEGORY table
CREATE TABLE categories (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(10) NOT NULL
        CHECK (category_type IN ('Income', 'Expense')),

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
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(10) NOT NULL
        CHECK (transaction_type IN ('Income', 'Expense')),
    payment_method VARCHAR(20) NOT NULL
        CHECK (payment_method IN ('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- A transaction can only use a category owned by the same user
    CONSTRAINT fk_transaction_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES categories(user_id, category_id)
);

-- 4. Create BUDGET table
CREATE TABLE budgets (
    budget_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    budget_amount NUMERIC(12, 2) NOT NULL
        CHECK (budget_amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_budget_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- A budget can only use a category owned by the same user;
    -- deleting a category also removes its budgets
    CONSTRAINT fk_budget_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES categories(user_id, category_id)
        ON DELETE CASCADE,

    -- At most one budget per category per month and year (Phase 3 business rule)
    CONSTRAINT uq_budget_category_month
        UNIQUE (user_id, category_id, month, year)
);

-- 5. Create indexes for commonly queried foreign keys
CREATE INDEX idx_transactions_user_date
    ON transactions(user_id, transaction_date);

CREATE INDEX idx_transactions_category
    ON transactions(category_id);

CREATE INDEX idx_categories_user
    ON categories(user_id);
