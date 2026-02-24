// ==================== DATA STORAGE MANAGEMENT ====================
// Uses localStorage - works immediately without database
// For data sync across devices, add DATABASE_URL in Vercel

const StorageManager = {
    ADMIN_PASSWORD: 'admin123',
    DB_KEY: 'pranil_',

    // Initialize with data
    async init() {
        if (!localStorage.getItem(this.DB_KEY + 'initialized')) {
            // Seed default data from data.js
            if (typeof companiesData !== 'undefined') {
                localStorage.setItem(this.DB_KEY + 'companies', JSON.stringify(companiesData));
                const allProducts = [];
                companiesData.forEach(c => {
                    c.products.forEach(p => {
                        allProducts.push({
                            ...p,
                            companyId: c.id,
                            companyName: c.name
                        });
                    });
                });
                localStorage.setItem(this.DB_KEY + 'products', JSON.stringify(allProducts));
            } else {
                localStorage.setItem(this.DB_KEY + 'companies', JSON.stringify([]));
                localStorage.setItem(this.DB_KEY + 'products', JSON.stringify([]));
            }
            localStorage.setItem(this.DB_KEY + 'orders', JSON.stringify([]));
            localStorage.setItem(this.DB_KEY + 'customers', JSON.stringify([]));
            localStorage.setItem(this.DB_KEY + 'initialized', 'true');
        }
    },

    // Generate unique ID
    generateId(prefix, collection) {
        const items = JSON.parse(localStorage.getItem(this.DB_KEY + collection) || '[]');
        const maxId = items.length > 0 ? Math.max(...items.map(i => i.id)) : 0;
        return `${prefix}${maxId + 1}`;
    },

    // ==================== COMPANIES ====================
    getCompanies() {
        return JSON.parse(localStorage.getItem(this.DB_KEY + 'companies') || '[]');
    },

    getCompanyById(id) {
        const companies = this.getCompanies();
        return companies.find(c => c.id === parseInt(id));
    },

    addCompany(company) {
        const companies = this.getCompanies();
        const id = companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1;
        const newCompany = {
            id,
            name: company.name,
            logo: company.logo || 'https://placehold.co/100x100/000/fff?text=' + company.name.charAt(0),
            bgColor: company.bgColor || '#000000',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        companies.push(newCompany);
        localStorage.setItem(this.DB_KEY + 'companies', JSON.stringify(companies));
        return newCompany;
    },

    updateCompany(id, updates) {
        const companies = this.getCompanies();
        const idx = companies.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) {
            companies[idx] = { ...companies[idx], ...updates };
            localStorage.setItem(this.DB_KEY + 'companies', JSON.stringify(companies));
            return companies[idx];
        }
        return null;
    },

    deleteCompany(id) {
        const companies = this.getCompanies();
        const filtered = companies.filter(c => c.id !== parseInt(id));
        localStorage.setItem(this.DB_KEY + 'companies', JSON.stringify(filtered));
        
        // Also delete products of this company
        const products = this.getProducts().filter(p => p.companyId !== parseInt(id));
        localStorage.setItem(this.DB_KEY + 'products', JSON.stringify(products));
        return true;
    },

    // ==================== PRODUCTS ====================
    getProducts(companyId = null) {
        let products = JSON.parse(localStorage.getItem(this.DB_KEY + 'products') || '[]');
        if (companyId) {
            products = products.filter(p => p.companyId === parseInt(companyId));
        }
        return products;
    },

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === parseInt(id));
    },

    addProduct(product) {
        const products = this.getProducts();
        const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 101;
        const company = this.getCompanyById(product.companyId);
        
        const newProduct = {
            id,
            companyId: parseInt(product.companyId),
            companyName: company ? company.name : 'Unknown',
            name: product.name,
            price: parseFloat(product.price),
            gram: product.gram || '0g',
            stock: parseInt(product.stock) || 0,
            image: product.image || '',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        localStorage.setItem(this.DB_KEY + 'products', JSON.stringify(products));
        return newProduct;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...updates };
            localStorage.setItem(this.DB_KEY + 'products', JSON.stringify(products));
            return products[idx];
        }
        return null;
    },

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== parseInt(id));
        localStorage.setItem(this.DB_KEY + 'products', JSON.stringify(products));
        return true;
    },

    // ==================== COMPANIES WITH PRODUCTS ====================
    getCompaniesWithProducts() {
        const companies = this.getCompanies().filter(c => c.isActive);
        const products = this.getProducts();
        
        return companies.map(company => ({
            id: company.id,
            name: company.name,
            logo: company.logo,
            bgColor: company.bgColor,
            products: products
                .filter(p => p.companyId === company.id && p.isActive)
                .map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    gram: p.gram,
                    stock: p.stock,
                    image: p.image
                }))
        }));
    },

    // ==================== CUSTOMERS ====================
    registerCustomer(data) {
        const customers = JSON.parse(localStorage.getItem(this.DB_KEY + 'customers') || '[]');
        
        if (customers.find(c => c.email === data.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        const id = 'CUST-' + Date.now();
        const customer = {
            id,
            email: data.email,
            password: this.hashPassword(data.password),
            name: data.name,
            phone: data.phone,
            location: data.location,
            pan: data.pan || '',
            createdAt: new Date().toISOString()
        };
        
        customers.push(customer);
        localStorage.setItem(this.DB_KEY + 'customers', JSON.stringify(customers));
        return { success: true, customerId: id, customer };
    },

    loginCustomer(email, password) {
        const customers = JSON.parse(localStorage.getItem(this.DB_KEY + 'customers') || '[]');
        const customer = customers.find(c => c.email === email && c.password === this.hashPassword(password));
        
        if (!customer) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        return {
            success: true,
            customerId: customer.id,
            customer: {
                customerId: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                location: customer.location,
                pan: customer.pan
            }
        };
    },

    getCustomerById(id) {
        const customers = JSON.parse(localStorage.getItem(this.DB_KEY + 'customers') || '[]');
        return customers.find(c => c.id === id);
    },

    // Simple hash
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = ((hash << 5) - hash) + password.charCodeAt(i);
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    // ==================== ORDERS ====================
    createOrder(order) {
        const orders = JSON.parse(localStorage.getItem(this.DB_KEY + 'orders') || '[]');
        const orderId = 'ORD-' + Date.now();
        
        const newOrder = {
            orderId,
            customerId: order.customerId,
            customer: order.customer,
            items: order.items,
            total: order.total,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        localStorage.setItem(this.DB_KEY + 'orders', JSON.stringify(orders));
        
        // Update product stock
        order.items.forEach(item => {
            this.updateProduct(item.id, { stock: Math.max(0, item.stock - 1) });
        });
        
        return newOrder;
    },

    getOrders() {
        return JSON.parse(localStorage.getItem(this.DB_KEY + 'orders') || '[]');
    },

    // ==================== STATS ====================
    getStats() {
        const companies = this.getCompanies();
        const products = this.getProducts();
        const orders = this.getOrders();
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        
        return {
            companies: companies.length,
            products: products.length,
            orders: orders.length,
            revenue: revenue,
            lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length
        };
    },

    // ==================== ADMIN ====================
    isAdminLoggedIn() {
        return sessionStorage.getItem('admin_logged_in') === 'true';
    },

    setAdminLoggedIn(status) {
        sessionStorage.setItem('admin_logged_in', status ? 'true' : 'false');
    },

    isCustomerLoggedIn() {
        return sessionStorage.getItem('current_user_id') !== null;
    },

    logoutCustomer() {
        sessionStorage.removeItem('current_user_id');
        sessionStorage.removeItem('current_user');
    },

    async getCurrentUser() {
        const id = sessionStorage.getItem('current_user_id');
        if (!id) return null;
        const customer = this.getCustomerById(id);
        if (!customer) return null;
        return {
            customerId: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            location: customer.location,
            pan: customer.pan
        };
    }
};

// Make it global
window.StorageManager = StorageManager;
