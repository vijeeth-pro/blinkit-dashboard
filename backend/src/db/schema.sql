-- Schema for Blinkit BI & Analytics Database

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS customer_feedback CASCADE;
DROP TABLE IF EXISTS marketing_performance CASCADE;
DROP TABLE IF EXISTS delivery_performance CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Products Table
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    margin_percentage NUMERIC(5, 2),
    shelf_life_days INT,
    min_stock_level INT,
    max_stock_level INT
);

-- Customers Table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    area VARCHAR(100),
    pincode VARCHAR(20),
    registration_date DATE,
    customer_segment VARCHAR(50),
    total_orders INT DEFAULT 0,
    avg_order_value NUMERIC(10, 2) DEFAULT 0.00
);

-- Orders Table
CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id) ON DELETE SET NULL,
    order_date TIMESTAMP NOT NULL,
    promised_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    delivery_status VARCHAR(50),
    order_total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    delivery_partner_id INT,
    store_id INT
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Delivery Performance Table
CREATE TABLE delivery_performance (
    order_id BIGINT PRIMARY KEY REFERENCES orders(order_id) ON DELETE CASCADE,
    delivery_partner_id INT,
    promised_time TIMESTAMP,
    actual_time TIMESTAMP,
    delivery_time_minutes NUMERIC(8, 2),
    distance_km NUMERIC(8, 2),
    delivery_status VARCHAR(50),
    reasons_if_delayed TEXT
);

-- Customer Feedback Table
CREATE TABLE customer_feedback (
    feedback_id INT PRIMARY KEY,
    order_id BIGINT REFERENCES orders(order_id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(customer_id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    feedback_category VARCHAR(100),
    sentiment VARCHAR(50),
    feedback_date DATE
);

-- Marketing Performance Table
CREATE TABLE marketing_performance (
    campaign_id INT PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    target_audience VARCHAR(100),
    channel VARCHAR(50),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    spend NUMERIC(10, 2) DEFAULT 0.00,
    revenue_generated NUMERIC(10, 2) DEFAULT 0.00,
    roas NUMERIC(8, 2) DEFAULT 0.00
);

-- Inventory Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    stock_received INT DEFAULT 0,
    damaged_stock INT DEFAULT 0
);

-- Strategic B-Tree Analytical Indexes
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_customers_segment ON customers(customer_segment);
CREATE INDEX idx_customers_area ON customers(area);

CREATE INDEX idx_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_feedback_sentiment ON customer_feedback(sentiment);

CREATE INDEX idx_marketing_date ON marketing_performance(date);
CREATE INDEX idx_marketing_channel ON marketing_performance(channel);
