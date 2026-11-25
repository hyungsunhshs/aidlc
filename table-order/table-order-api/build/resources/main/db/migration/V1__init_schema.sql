-- V1__init_schema.sql
-- Table Order Service Database Schema

-- ==========================================
-- 1. Store (매장)
-- ==========================================
CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identifier VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_stores_identifier ON stores(identifier);

-- ==========================================
-- 2. Tables (테이블)
-- ==========================================
CREATE TABLE tables (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(store_id, table_number)
);

CREATE INDEX idx_tables_store_table_number ON tables(store_id, table_number);

-- ==========================================
-- 3. Admins (관리자)
-- ==========================================
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(store_id, username)
);

CREATE INDEX idx_admins_store_username ON admins(store_id, username);

-- ==========================================
-- 4. Categories (카테고리)
-- ==========================================
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_categories_store_display_order ON categories(store_id, display_order);

-- ==========================================
-- 5. Menus (메뉴)
-- ==========================================
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    description VARCHAR(500),
    image_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_menus_category_display_order ON menus(category_id, display_order);
CREATE INDEX idx_menus_category_deleted_available ON menus(category_id, is_deleted, is_available);

-- ==========================================
-- 6. Table Sessions (테이블 세션)
-- ==========================================
CREATE TABLE table_sessions (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_table_sessions_table_status ON table_sessions(table_id, status);
CREATE INDEX idx_table_sessions_started_at ON table_sessions(started_at);

-- ==========================================
-- 7. Daily Order Sequences (일별 주문 순번)
-- ==========================================
CREATE TABLE daily_order_sequences (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    UNIQUE(store_id, order_date)
);

CREATE INDEX idx_daily_order_sequences_store_date ON daily_order_sequences(store_id, order_date);

-- ==========================================
-- 8. Orders (주문)
-- ==========================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_session_created ON orders(session_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);

-- ==========================================
-- 9. Order Items (주문 항목)
-- ==========================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id BIGINT,
    menu_name VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ==========================================
-- 10. Order Histories (주문 이력)
-- ==========================================
CREATE TABLE order_histories (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    session_id BIGINT NOT NULL,
    order_data TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_histories_table_completed ON order_histories(table_id, completed_at);
