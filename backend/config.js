// ==================== DATABASE CONFIGURATION ====================
// SQL Database Configuration for Pranil Sales and Marketing Platform

const DatabaseConfig = {
    // Database Connection Settings
    connection: {
        host: 'localhost',
        port: 3306,
        database: 'pranil_ecommerce',
        charset: 'utf8mb4'
    },

    // Table Schemas
    schemas: {
        customers: `
            CREATE TABLE IF NOT EXISTS customers (
                customer_id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL UNIQUE,
                location TEXT NOT NULL,
                pan_number VARCHAR(50),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_phone (phone)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `,

        companies: `
            CREATE TABLE IF NOT EXISTS companies (
                company_id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                logo_url TEXT,
                background_color VARCHAR(7) DEFAULT '#000000',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `,

        products: `
            CREATE TABLE IF NOT EXISTS products (
                product_id INT AUTO_INCREMENT PRIMARY KEY,
                company_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                weight VARCHAR(50) NOT NULL,
                stock_quantity INT NOT NULL DEFAULT 0,
                image_url TEXT,
                icon_emoji VARCHAR(10),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
                INDEX idx_company (company_id),
                INDEX idx_stock (stock_quantity),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `,

        orders: `
            CREATE TABLE IF NOT EXISTS orders (
                order_id VARCHAR(50) PRIMARY KEY,
                customer_id VARCHAR(50),
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_location TEXT NOT NULL,
                customer_pan VARCHAR(50),
                total_amount DECIMAL(12, 2) NOT NULL,
                order_status VARCHAR(50) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
                INDEX idx_customer (customer_id),
                INDEX idx_status (order_status),
                INDEX idx_date (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `,

        order_items: `
            CREATE TABLE IF NOT EXISTS order_items (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) NOT NULL,
                product_id INT,
                product_name VARCHAR(255) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                weight VARCHAR(50) NOT NULL,
                icon_emoji VARCHAR(10),
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
                INDEX idx_order (order_id),
                INDEX idx_product (product_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `,

        admin_users: `
            CREATE TABLE IF NOT EXISTS admin_users (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_username (username)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
    },

    // SQL Queries
    queries: {
        // Customer Queries
        insertCustomer: `
            INSERT INTO customers (customer_id, email, password_hash, full_name, phone, location, pan_number)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,

        getCustomerByEmail: `
            SELECT * FROM customers WHERE email = ? AND is_active = TRUE
        `,

        getCustomerById: `
            SELECT customer_id, email, full_name, phone, location, pan_number, created_at, last_login
            FROM customers WHERE customer_id = ? AND is_active = TRUE
        `,

        updateCustomerProfile: `
            UPDATE customers 
            SET full_name = ?, phone = ?, location = ?, pan_number = ?, updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = ?
        `,

        updateCustomerPassword: `
            UPDATE customers 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = ?
        `,

        updateLastLogin: `
            UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE customer_id = ?
        `,

        // Company Queries
        getAllCompanies: `
            SELECT * FROM companies WHERE is_active = TRUE ORDER BY company_name
        `,

        getCompanyById: `
            SELECT * FROM companies WHERE company_id = ? AND is_active = TRUE
        `,

        insertCompany: `
            INSERT INTO companies (company_name, logo_url, background_color)
            VALUES (?, ?, ?)
        `,

        deleteCompany: `
            UPDATE companies SET is_active = FALSE WHERE company_id = ?
        `,

        // Product Queries
        getProductsByCompany: `
            SELECT * FROM products 
            WHERE company_id = ? AND is_active = TRUE 
            ORDER BY product_name
        `,

        getProductById: `
            SELECT * FROM products WHERE product_id = ? AND is_active = TRUE
        `,

        insertProduct: `
            INSERT INTO products (company_id, product_name, price, weight, stock_quantity, image_url, icon_emoji)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,

        updateProduct: `
            UPDATE products 
            SET product_name = ?, price = ?, weight = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ?
        `,

        updateProductStock: `
            UPDATE products 
            SET stock_quantity = stock_quantity - 1, updated_at = CURRENT_TIMESTAMP
            WHERE product_id = ? AND stock_quantity > 0
        `,

        deleteProduct: `
            UPDATE products SET is_active = FALSE WHERE product_id = ?
        `,

        // Order Queries
        insertOrder: `
            INSERT INTO orders (order_id, customer_id, customer_name, customer_phone, customer_location, customer_pan, total_amount, order_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,

        insertOrderItem: `
            INSERT INTO order_items (order_id, product_id, product_name, company_name, price, weight, icon_emoji)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `,

        getOrdersByCustomer: `
            SELECT o.*, 
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'product_name', oi.product_name,
                           'company_name', oi.company_name,
                           'price', oi.price,
                           'weight', oi.weight,
                           'icon', oi.icon_emoji
                       )
                   ) FROM order_items oi WHERE oi.order_id = o.order_id) as items
            FROM orders o
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
        `,

        getAllOrders: `
            SELECT o.*,
                   (SELECT JSON_ARRAYAGG(
                       JSON_OBJECT(
                           'product_name', oi.product_name,
                           'company_name', oi.company_name,
                           'price', oi.price,
                           'weight', oi.weight,
                           'icon', oi.icon_emoji
                       )
                   ) FROM order_items oi WHERE oi.order_id = o.order_id) as items
            FROM orders o
            ORDER BY o.created_at DESC
            LIMIT 100
        `,

        // Statistics Queries
        getCustomerStats: `
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_amount), 0) as total_spent,
                COALESCE(AVG(total_amount), 0) as average_order
            FROM orders
            WHERE customer_id = ?
        `
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseConfig;
}