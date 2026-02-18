// ==================== DATA STORAGE MANAGEMENT ====================
// Professional Storage Manager with SQL Database Integration

const StorageManager = {
    ADMIN_PASSWORD: 'admin123',

    // Initialize storage system
    async init() {
        await Database.init();
        
        // Initialize with seed data if empty
        const companies = await Database.select('companies');
        if (companies.length === 0) {
            await this.seedInitialData();
        }
    },

    // Seed initial data
    async seedInitialData() {
        const companies = [
            { company_id: 1, company_name: "Tech Solutions", logo_url: "https://via.placeholder.com/100/000000/FFFFFF?text=Tech", background_color: "#000000" },
            { company_id: 2, company_name: "Home Essentials", logo_url: "https://via.placeholder.com/100/1a1a1a/FFFFFF?text=Home", background_color: "#1a1a1a" },
            { company_id: 3, company_name: "Fashion Hub", logo_url: "https://via.placeholder.com/100/2a2a2a/FFFFFF?text=Fashion", background_color: "#2a2a2a" },
            { company_id: 4, company_name: "Beauty Care", logo_url: "https://via.placeholder.com/100/3a3a3a/FFFFFF?text=Beauty", background_color: "#3a3a3a" },
            { company_id: 5, company_name: "Sports Gear", logo_url: "https://via.placeholder.com/100/4a4a4a/FFFFFF?text=Sports", background_color: "#4a4a4a" }
        ];

        const products = [
            { product_id: 101, company_id: 1, product_name: "Wireless Mouse", price: 1299, weight: "120g", stock_quantity: 50 },
            { product_id: 102, company_id: 1, product_name: "Mechanical Keyboard", price: 4999, weight: "980g", stock_quantity: 30 },
            { product_id: 103, company_id: 1, product_name: "USB Hub", price: 899, weight: "85g", stock_quantity: 100 },
            { product_id: 201, company_id: 2, product_name: "Kitchen Knife Set", price: 2499, weight: "450g", stock_quantity: 25 },
            { product_id: 202, company_id: 2, product_name: "Glass Storage Jars", price: 799, weight: "1200g", stock_quantity: 60 },
            { product_id: 203, company_id: 2, product_name: "LED Bulbs Pack", price: 599, weight: "240g", stock_quantity: 150 },
            { product_id: 301, company_id: 3, product_name: "Cotton T-Shirt", price: 599, weight: "180g", stock_quantity: 75 },
            { product_id: 302, company_id: 3, product_name: "Denim Jeans", price: 1999, weight: "550g", stock_quantity: 40 },
            { product_id: 303, company_id: 3, product_name: "Sneakers", price: 2499, weight: "800g", stock_quantity: 35 },
            { product_id: 401, company_id: 4, product_name: "Face Cream", price: 899, weight: "50g", stock_quantity: 80 },
            { product_id: 402, company_id: 4, product_name: "Shampoo", price: 449, weight: "200ml", stock_quantity: 100 },
            { product_id: 403, company_id: 4, product_name: "Lipstick", price: 599, weight: "4g", stock_quantity: 60 },
            { product_id: 501, company_id: 5, product_name: "Yoga Mat", price: 1299, weight: "1200g", stock_quantity: 45 },
            { product_id: 502, company_id: 5, product_name: "Dumbbells Set", price: 2999, weight: "5000g", stock_quantity: 20 },
            { product_id: 503, company_id: 5, product_name: "Resistance Bands", price: 799, weight: "150g", stock_quantity: 70 }
        ];

        for (const company of companies) {
            await Database.insert('companies', company);
        }

        for (const product of products) {
            await Database.insert('products', product);
        }
    },

    // ==================== COMPANIES ====================
    async getCompanies() {
        const companies = await Database.select('companies', { is_active: true });
        
        // Fetch products for each company
        for (const company of companies) {
            company.products = await Database.select('products', { 
                company_id: company.company_id, 
                is_active: true 
            });
        }

        return companies.map(c => ({
            id: c.company_id,
            name: c.company_name,
            logo: c.logo_url,
            bgColor: c.background_color,
            products: c.products.map(p => ({
                id: p.product_id,
                name: p.product_name,
                price: p.price,
                gram: p.weight,
                stock: p.stock_quantity,
                image: p.icon_emoji || ""
            }))
        }));
    },

    async getCompanyById(companyId) {
        const companies = await this.getCompanies();
        return companies.find(c => c.id === companyId);
    },

    // ==================== CUSTOMER AUTHENTICATION ====================
    async registerCustomer(customerData) {
        const { email, password, name, phone, location, pan } = customerData;

        // Validation
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Invalid email format' };
        }

        // Check if email exists
        const existing = await Database.findOne('customers', { email });
        if (existing) {
            return { success: false, message: 'Email already registered' };
        }

        // Check if phone exists
        const existingPhone = await Database.findOne('customers', { phone });
        if (existingPhone) {
            return { success: false, message: 'Phone number already registered' };
        }

        // Create customer
        const customerId = Database.generateId('CUST-');
        const passwordHash = Database.hashPassword(password);

        const customer = {
            customer_id: customerId,
            email,
            password_hash: passwordHash,
            full_name: name,
            phone,
            location,
            pan_number: pan || null,
            is_active: true
        };

        await Database.insert('customers', customer);

        return { success: true, message: 'Registration successful', customerId };
    },

    async loginCustomer(email, password) {
        const customer = await Database.findOne('customers', { email, is_active: true });

        if (!customer) {
            return { success: false, message: 'Email not found' };
        }

        const passwordHash = Database.hashPassword(password);
        if (customer.password_hash !== passwordHash) {
            return { success: false, message: 'Incorrect password' };
        }

        // Update last login
        await Database.update('customers', { customer_id: customer.customer_id }, {
            last_login: new Date().toISOString()
        });

        // Store session
        sessionStorage.setItem('current_user_id', customer.customer_id);

        return {
            success: true,
            message: 'Login successful',
            customerId: customer.customer_id,
            customer: {
                customerId: customer.customer_id,
                name: customer.full_name,
                email: customer.email,
                phone: customer.phone,
                location: customer.location,
                pan: customer.pan_number
            }
        };
    },

    logoutCustomer() {
        sessionStorage.removeItem('current_user_id');
    },

    async getCurrentUser() {
        const customerId = sessionStorage.getItem('current_user_id');
        if (!customerId) return null;

        const customer = await Database.findOne('customers', { customer_id: customerId });
        if (!customer) return null;

        return {
            customerId: customer.customer_id,
            name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            location: customer.location,
            pan: customer.pan_number,
            registeredDate: customer.created_at,
            lastLogin: customer.last_login
        };
    },

    isCustomerLoggedIn() {
        return sessionStorage.getItem('current_user_id') !== null;
    },

    async updateCustomerProfile(customerId, updates) {
        delete updates.email;
        delete updates.password;

        const updated = await Database.update('customers', { customer_id: customerId }, {
            full_name: updates.name,
            phone: updates.phone,
            location: updates.location,
            pan_number: updates.pan
        });

        if (updated) {
            return { success: true, message: 'Profile updated successfully' };
        }

        return { success: false, message: 'Update failed' };
    },

    async changePassword(customerId, oldPassword, newPassword) {
        const customer = await Database.findOne('customers', { customer_id: customerId });
        if (!customer) {
            return { success: false, message: 'Customer not found' };
        }

        const oldHash = Database.hashPassword(oldPassword);
        if (customer.password_hash !== oldHash) {
            return { success: false, message: 'Incorrect old password' };
        }

        const newHash = Database.hashPassword(newPassword);
        await Database.update('customers', { customer_id: customerId }, {
            password_hash: newHash
        });

        return { success: true, message: 'Password changed successfully' };
    },

    // ==================== ORDERS ====================
    async saveOrder(order) {
        // Insert order
        await Database.insert('orders', {
            order_id: order.orderId,
            customer_id: order.customerId,
            customer_name: order.customer.name,
            customer_phone: order.customer.phone,
            customer_location: order.customer.location,
            customer_pan: order.customer.pan,
            total_amount: order.total,
            order_status: 'completed'
        });

        // Insert order items
        for (const item of order.items) {
            await Database.insert('order_items', {
                order_id: order.orderId,
                product_id: item.id,
                product_name: item.name,
                company_name: item.companyName,
                price: item.price,
                weight: item.gram,
                icon_emoji: item.image || ""
            });
        }

        return order;
    },

    async getOrdersByCustomer(customerId) {
        const orders = await Database.select('orders', { customer_id: customerId });
        
        for (const order of orders) {
            order.items = await Database.select('order_items', { order_id: order.order_id });
        }

        return orders.map(o => ({
            orderId: o.order_id,
            customerId: o.customer_id,
            customer: {
                name: o.customer_name,
                phone: o.customer_phone,
                location: o.customer_location,
                pan: o.customer_pan
            },
            items: o.items.map(i => ({
                name: i.product_name,
                companyName: i.company_name,
                price: i.price,
                gram: i.weight,
                image: i.icon_emoji
            })),
            total: o.total_amount,
            date: o.created_at,
            status: o.order_status
        }));
    },

    async getCustomerStats(customerId) {
        const stats = await Database.aggregate('orders', 
            { customer_id: customerId },
            { count: true, sum: ['total_amount'], avg: ['total_amount'] }
        );

        return {
            totalOrders: stats.count || 0,
            totalSpent: stats.sum_total_amount || 0,
            averageOrderValue: stats.avg_total_amount || 0
        };
    },

    // ==================== ADMIN ====================
    isAdminLoggedIn() {
        return sessionStorage.getItem('admin_logged_in') === 'true';
    },

    setAdminLoggedIn(status) {
        sessionStorage.setItem('admin_logged_in', status ? 'true' : 'false');
    },

    // ==================== UTILITIES ====================
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    generateOrderId() {
        return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
};