-- Database Schema for Pranil Sales E-Commerce Platform
-- Compatible with PostgreSQL (Neon, Supabase, etc.)

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    background_color VARCHAR(20) DEFAULT '#000000',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    weight VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    icon_emoji VARCHAR(10),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    pan_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_location TEXT NOT NULL,
    customer_pan VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),
    product_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    weight VARCHAR(50),
    icon_emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default companies
INSERT INTO companies (company_name, logo_url, background_color, description) VALUES
('Tech Solutions', 'https://placehold.co/100x100/667eea/ffffff?text=Tech', '#667eea', 'Premium tech gadgets and accessories'),
('Home Essentials', 'https://placehold.co/100x100/f093fb/ffffff?text=Home', '#f093fb', 'Everything for your home'),
('Fashion Hub', 'https://placehold.co/100x100/4facfe/ffffff?text=Fashion', '#4facfe', 'Trendy clothing and accessories'),
('Beauty Care', 'https://placehold.co/100x100/43e97b/ffffff?text=Beauty', '#43e97b', 'Premium beauty products'),
('Sports Gear', 'https://placehold.co/100x100/fa709a/ffffff?text=Sports', '#fa709a', 'Sports equipment and fitness')
ON CONFLICT DO NOTHING;

-- Insert default products
INSERT INTO products (company_id, product_name, description, price, weight, stock_quantity, icon_emoji) VALUES
(1, 'Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 1299, '120g', 50, '🖱️'),
(1, 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 4999, '980g', 30, '⌨️'),
(1, 'USB Hub', '7-port USB 3.0 hub with power adapter', 899, '85g', 100, '🔌'),
(1, 'Webcam HD', '1080p HD webcam with microphone', 2499, '150g', 25, '📷'),
(1, 'Laptop Stand', 'Adjustable aluminum laptop stand', 1499, '400g', 45, '💻'),

(2, 'Kitchen Knife Set', 'Professional 5-piece kitchen knife set', 2499, '450g', 25, '🔪'),
(2, 'Glass Storage Jars', 'Set of 6 glass jars with lids', 799, '1200g', 60, '🫙'),
(2, 'LED Bulbs Pack', 'Pack of 4 LED bulbs 10W', 599, '240g', 150, '💡'),
(2, 'Vacuum Cleaner', 'Cordless stick vacuum cleaner', 8999, '2500g', 15, '🧹'),
(2, 'Air Fryer', 'Digital air fryer 5.8L', 5999, '3500g', 20, '🍟'),

(3, 'Cotton T-Shirt', 'Premium cotton round neck t-shirt', 599, '180g', 75, '👕'),
(3, 'Denim Jeans', 'Classic fit denim jeans', 1999, '550g', 40, '👖'),
(3, 'Sneakers', 'Comfortable running sneakers', 2499, '800g', 35, '👟'),
(3, 'Winter Jacket', 'Waterproof winter jacket', 3999, '1200g', 20, '🧥'),
(3, 'Sports Cap', 'Adjustable sports cap', 399, '80g', 100, '🧢'),

(4, 'Face Cream', 'Anti-aging face cream 50ml', 899, '50g', 80, '🧴'),
(4, 'Shampoo', 'Hair strengthening shampoo 200ml', 449, '200ml', 100, '🧴'),
(4, 'Lipstick', 'Long-lasting matte lipstick', 599, '4g', 60, '💄'),
(4, 'Perfume', 'Floral fragrance 50ml', 1499, '50ml', 40, '🧴'),
(4, 'Moisturizer', 'Daily moisturizer 100ml', 699, '100ml', 70, '🧴'),

(5, 'Yoga Mat', 'Non-slip yoga mat 6mm', 1299, '1200g', 45, '🧘'),
(5, 'Dumbbells Set', 'Adjustable dumbbells 20kg', 2999, '5000g', 20, '🏋️'),
(5, 'Resistance Bands', 'Set of 5 resistance bands', 799, '150g', 70, '🎽'),
(5, 'Skipping Rope', 'Speed skipping rope with bearings', 399, '100g', 120, '⚡'),
(5, 'Water Bottle', 'Insulated water bottle 1L', 699, '300g', 80, '🍶')
ON CONFLICT DO NOTHING;
