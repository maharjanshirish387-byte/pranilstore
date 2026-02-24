// ==================== DATA STORAGE MANAGEMENT ====================
// Professional Storage Manager with SQL Database Integration

const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.apiBase) || '';

const StorageManager = {
    ADMIN_PASSWORD: 'admin123',

    // Initialize - load from API
    async init() {
        // Just ensure DB is initialized (no local seeding anymore)
    },

    // ==================== COMPANIES (from API) ====================
    async getCompanies() {
        try {
            const res = await fetch(`${API_BASE}/api/companies`);
            const companies = await res.json();
            
            // Fetch products for each company
            for (const company of companies) {
                const resProducts = await fetch(`${API_BASE}/api/products?company_id=${company.company_id}`);
                company.products = await resProducts.json();
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
        } catch (err) {
            console.error('Failed to fetch companies:', err);
            return [];
        }
    },

    async getCompanyById(companyId) {
        const companies = await this.getCompanies();
        return companies.find(c => c.id === companyId);
    },

    // Add company (via API)
    async addCompany(company) {
        const res = await fetch(`${API_BASE}/api/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(company)
        });
        return await res.json();
    },

    // Update company (via API)
    async updateCompany(companyId, updates) {
        await fetch(`${API_BASE}/api/companies/${companyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return { success: true };
    },

    // Delete company (via API)
    async deleteCompany(companyId) {
        await fetch(`${API_BASE}/api/companies/${companyId}`, {
            method: 'DELETE'
        });
        return { success: true };
    },

    // ==================== PRODUCTS (from API) ====================
    async getAllProducts() {
        const res = await fetch(`${API_BASE}/api/products`);
        return await res.json();
    },

    // Add product (via API)
    async addProduct(product) {
        const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await res.json();
    },

    // Update product (via API)
    async updateProduct(productId, updates) {
        await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return { success: true };
    },

    // Delete product (via API)
    async deleteProduct(productId) {
        await fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'DELETE'
        });
        return { success: true };
    },

    // ==================== CUSTOMER AUTHENTICATION (from API) ====================
    async registerCustomer(customerData) {
        const { email, password, name, phone, location, pan } = customerData;

        try {
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, location, pan, password })
            });
            const data = await res.json();
            
            if (!res.ok) {
                return { success: false, message: data.error || 'Registration failed' };
            }
            
            return { success: true, message: 'Registration successful', customerId: data.customer.customerId };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async loginCustomer(email, password) {
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (!res.ok || !data.success) {
                return { success: false, message: data.error || 'Login failed' };
            }

            sessionStorage.setItem('current_user_id', data.customer.customerId);

            return {
                success: true,
                message: 'Login successful',
                customerId: data.customer.customerId,
                customer: {
                    customerId: data.customer.customerId,
                    name: data.customer.name,
                    email: data.customer.email,
                    phone: data.customer.phone,
                    location: data.customer.location,
                    pan: data.customer.pan
                }
            };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    logoutCustomer() {
        sessionStorage.removeItem('current_user_id');
    },

    async getCurrentUser() {
        const customerId = sessionStorage.getItem('current_user_id');
        if (!customerId) return null;
        
        // We need to fetch customer data - for now return stored data
        const stored = sessionStorage.getItem('current_user');
        if (stored) {
            return JSON.parse(stored);
        }
        return { customerId, name: 'User' };
    },

    isCustomerLoggedIn() {
        return sessionStorage.getItem('current_user_id') !== null;
    },

    async updateCustomerProfile(customerId, updates) {
        return { success: false, message: 'Not implemented' };
    },

    async changePassword(customerId, oldPassword, newPassword) {
        return { success: false, message: 'Not implemented' };
    },

    // ==================== ORDERS ====================
    async saveOrder(order) {
        try {
            await fetch(`${API_BASE}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
        } catch (err) {
            console.error('Failed to save order:', err);
        }
        return order;
    },

    async getOrdersByCustomer(customerId) {
        return [];
    },

    async getCustomerStats(customerId) {
        return { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
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