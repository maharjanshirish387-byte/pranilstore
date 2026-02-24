// ==================== DATA STORAGE MANAGEMENT ====================
// Uses API for data sync across all users

const API_BASE = '';

const StorageManager = {
    ADMIN_PASSWORD: 'admin123',
    cache: { companies: null, products: null },
    initialized: false,

    async init() {
        // Load initial data from API
        await this.refreshData();
        this.initialized = true;
    },

    async refreshData() {
        try {
            const [companiesRes, productsRes] = await Promise.all([
                fetch(`${API_BASE}/api/companies`),
                fetch(`${API_BASE}/api/products`)
            ]);
            this.cache.companies = await companiesRes.json();
            this.cache.products = await productsRes.json();
        } catch (err) {
            console.error('Failed to load data:', err);
            this.cache.companies = [];
            this.cache.products = [];
        }
    },

    // ==================== COMPANIES ====================
    async getCompanies() {
        if (!this.cache.companies) await this.refreshData();
        return this.cache.companies.map(c => ({
            id: c.id,
            name: c.name,
            logo: c.logo,
            bgColor: c.bgColor,
            isActive: c.isActive
        }));
    },

    async getCompanyById(id) {
        const companies = await this.getCompanies();
        return companies.find(c => c.id === parseInt(id));
    },

    async addCompany(data) {
        const res = await fetch(`${API_BASE}/api/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const company = await res.json();
        await this.refreshData();
        return company;
    },

    async updateCompany(id, data) {
        await fetch(`${API_BASE}/api/companies/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        await this.refreshData();
        return { success: true };
    },

    async deleteCompany(id) {
        await fetch(`${API_BASE}/api/companies/${id}`, { method: 'DELETE' });
        await this.refreshData();
        return { success: true };
    },

    // ==================== PRODUCTS ====================
    async getProducts(companyId = null) {
        if (!this.cache.products) await this.refreshData();
        let products = this.cache.products;
        if (companyId) {
            products = products.filter(p => p.companyId === parseInt(companyId));
        }
        return products;
    },

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === parseInt(id));
    },

    async addProduct(data) {
        const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const product = await res.json();
        await this.refreshData();
        return product;
    },

    async updateProduct(id, data) {
        await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        await this.refreshData();
        return { success: true };
    },

    async deleteProduct(id) {
        await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
        await this.refreshData();
        return { success: true };
    },

    // ==================== COMPANIES WITH PRODUCTS ====================
    async getCompaniesWithProducts() {
        const companies = await this.getCompanies();
        const products = await this.getProducts();
        
        return companies.map(company => ({
            ...company,
            products: products.filter(p => p.companyId === company.id)
        }));
    },

    // ==================== ORDERS ====================
    async createOrder(order) {
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        await this.refreshData();
        return await res.json();
    },

    async getOrders() {
        const res = await fetch(`${API_BASE}/api/orders`);
        return await res.json();
    },

    // ==================== STATS ====================
    async getStats() {
        const res = await fetch(`${API_BASE}/api/stats`);
        return await res.json();
    },

    // ==================== ADMIN ====================
    isAdminLoggedIn() {
        return sessionStorage.getItem('admin_logged_in') === 'true';
    },

    setAdminLoggedIn(status) {
        sessionStorage.setItem('admin_logged_in', status ? 'true' : 'false');
    },

    // ==================== CUSTOMERS (local only) ====================
    isCustomerLoggedIn() {
        return sessionStorage.getItem('current_user_id') !== null;
    },

    logoutCustomer() {
        sessionStorage.removeItem('current_user_id');
        sessionStorage.removeItem('current_user');
    },

    async getCurrentUser() {
        const user = sessionStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    },

    registerCustomer(data) {
        // Simple local registration
        const id = 'CUST-' + Date.now();
        sessionStorage.setItem('current_user_id', id);
        sessionStorage.setItem('current_user', JSON.stringify({ customerId: id, ...data }));
        return { success: true, customerId: id };
    },

    loginCustomer(email, password) {
        // Demo login - accepts any email/password
        const id = 'CUST-' + Date.now();
        sessionStorage.setItem('current_user_id', id);
        sessionStorage.setItem('current_user', JSON.stringify({ customerId: id, name: email.split('@')[0], email }));
        return { success: true, customerId: id };
    }
};

window.StorageManager = StorageManager;
