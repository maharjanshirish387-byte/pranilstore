const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File-based database
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if it doesn't exist
function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            customers: [],
            orders: [],
            order_items: [],
            companies: [
                { company_id: 1, company_name: "Tech Solutions", logo_url: "https://via.placeholder.com/100/000000/FFFFFF?text=Tech", background_color: "#000000", is_active: true },
                { company_id: 2, company_name: "Home Essentials", logo_url: "https://via.placeholder.com/100/1a1a1a/FFFFFF?text=Home", background_color: "#1a1a1a", is_active: true },
                { company_id: 3, company_name: "Fashion Hub", logo_url: "https://via.placeholder.com/100/2a2a2a/FFFFFF?text=Fashion", background_color: "#2a2a2a", is_active: true },
                { company_id: 4, company_name: "Beauty Care", logo_url: "https://via.placeholder.com/100/3a3a3a/FFFFFF?text=Beauty", background_color: "#3a3a3a", is_active: true },
                { company_id: 5, company_name: "Sports Gear", logo_url: "https://via.placeholder.com/100/4a4a4a/FFFFFF?text=Sports", background_color: "#4a4a4a", is_active: true }
            ],
            products: [
                { product_id: 101, company_id: 1, product_name: "Wireless Mouse", price: 1299, weight: "120g", stock_quantity: 50, icon_emoji: "🖱️", is_active: true },
                { product_id: 102, company_id: 1, product_name: "Mechanical Keyboard", price: 4999, weight: "980g", stock_quantity: 30, icon_emoji: "⌨️", is_active: true },
                { product_id: 103, company_id: 1, product_name: "USB Hub", price: 899, weight: "85g", stock_quantity: 100, icon_emoji: "🔌", is_active: true },
                { product_id: 201, company_id: 2, product_name: "Kitchen Knife Set", price: 2499, weight: "450g", stock_quantity: 25, icon_emoji: "🔪", is_active: true },
                { product_id: 202, company_id: 2, product_name: "Glass Storage Jars", price: 799, weight: "1200g", stock_quantity: 60, icon_emoji: "🫙", is_active: true },
                { product_id: 203, company_id: 2, product_name: "LED Bulbs Pack", price: 599, weight: "240g", stock_quantity: 150, icon_emoji: "💡", is_active: true },
                { product_id: 301, company_id: 3, product_name: "Cotton T-Shirt", price: 599, weight: "180g", stock_quantity: 75, icon_emoji: "👕", is_active: true },
                { product_id: 302, company_id: 3, product_name: "Denim Jeans", price: 1999, weight: "550g", stock_quantity: 40, icon_emoji: "👖", is_active: true },
                { product_id: 303, company_id: 3, product_name: "Sneakers", price: 2499, weight: "800g", stock_quantity: 35, icon_emoji: "👟", is_active: true },
                { product_id: 401, company_id: 4, product_name: "Face Cream", price: 899, weight: "50g", stock_quantity: 80, icon_emoji: "🧴", is_active: true },
                { product_id: 402, company_id: 4, product_name: "Shampoo", price: 449, weight: "200ml", stock_quantity: 100, icon_emoji: "🧴", is_active: true },
                { product_id: 403, company_id: 4, product_name: "Lipstick", price: 599, weight: "4g", stock_quantity: 60, icon_emoji: "💄", is_active: true },
                { product_id: 501, company_id: 5, product_name: "Yoga Mat", price: 1299, weight: "1200g", stock_quantity: 45, icon_emoji: "🧘", is_active: true },
                { product_id: 502, company_id: 5, product_name: "Dumbbells Set", price: 2999, weight: "5000g", stock_quantity: 20, icon_emoji: "🏋️", is_active: true },
                { product_id: 503, company_id: 5, product_name: "Resistance Bands", price: 799, weight: "150g", stock_quantity: 70, icon_emoji: "🎽", is_active: true }
            ]
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read database
function readDB() {
    initDB();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Write database
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Simple hash function
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// API routes
app.get('/api/companies', (req, res) => {
    const db = readDB();
    res.json(db.companies.filter(c => c.is_active));
});

app.get('/api/companies/:id', (req, res) => {
    const db = readDB();
    const company = db.companies.find(c => c.company_id === parseInt(req.params.id) && c.is_active);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
});

app.post('/api/companies', (req, res) => {
    const db = readDB();
    const { company_name, logo_url, background_color } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name required' });
    
    const maxId = db.companies.length > 0 ? Math.max(...db.companies.map(c => c.company_id)) : 0;
    const company = {
        company_id: maxId + 1,
        company_name,
        logo_url: logo_url || '',
        background_color: background_color || '#000000',
        is_active: true
    };
    db.companies.push(company);
    writeDB(db);
    res.status(201).json(company);
});

app.patch('/api/companies/:id', (req, res) => {
    const db = readDB();
    const idx = db.companies.findIndex(c => c.company_id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Company not found' });
    
    const { company_name, logo_url, background_color } = req.body;
    if (company_name) db.companies[idx].company_name = company_name;
    if (logo_url) db.companies[idx].logo_url = logo_url;
    if (background_color) db.companies[idx].background_color = background_color;
    
    writeDB(db);
    res.json(db.companies[idx]);
});

app.delete('/api/companies/:id', (req, res) => {
    const db = readDB();
    const idx = db.companies.findIndex(c => c.company_id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Company not found' });
    db.companies[idx].is_active = false;
    writeDB(db);
    res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => {
    const db = readDB();
    let products = db.products.filter(p => p.is_active);
    if (req.query.company_id) {
        products = products.filter(p => p.company_id === parseInt(req.query.company_id));
    }
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const db = readDB();
    const product = db.products.find(p => p.product_id === parseInt(req.params.id) && p.is_active);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

app.post('/api/products', (req, res) => {
    const db = readDB();
    const { company_id, product_name, price, weight, stock_quantity, icon_emoji } = req.body;
    if (!company_id || !product_name || price == null) {
        return res.status(400).json({ error: 'company_id, product_name, and price are required' });
    }
    
    const maxId = db.products.length > 0 ? Math.max(...db.products.map(p => p.product_id)) : 100;
    const product = {
        product_id: maxId + 1,
        company_id: parseInt(company_id),
        product_name,
        price: parseFloat(price),
        weight: weight || '',
        stock_quantity: parseInt(stock_quantity) || 0,
        icon_emoji: icon_emoji || '',
        is_active: true
    };
    db.products.push(product);
    writeDB(db);
    res.status(201).json(product);
});

app.patch('/api/products/:id', (req, res) => {
    const db = readDB();
    const idx = db.products.findIndex(p => p.product_id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    
    const { product_name, price, weight, stock_quantity, icon_emoji } = req.body;
    if (product_name) db.products[idx].product_name = product_name;
    if (price != null) db.products[idx].price = parseFloat(price);
    if (weight) db.products[idx].weight = weight;
    if (stock_quantity != null) db.products[idx].stock_quantity = parseInt(stock_quantity);
    if (icon_emoji) db.products[idx].icon_emoji = icon_emoji;
    
    writeDB(db);
    res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
    const db = readDB();
    const idx = db.products.findIndex(p => p.product_id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    db.products[idx].is_active = false;
    writeDB(db);
    res.json({ success: true });
});

// Auth
app.post('/api/register', (req, res) => {
    const db = readDB();
    const { name, email, phone, location, pan, password } = req.body || {};
    if (!email || !password || !name || !phone || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = db.customers.find(c => c.email === email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const customerId = `CUST-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const customer = {
        customer_id: customerId,
        email,
        password_hash: simpleHash(password),
        full_name: name,
        phone,
        location,
        pan_number: pan || null,
        is_active: true,
        created_at: new Date().toISOString()
    };

    db.customers.push(customer);
    writeDB(db);

    res.json({ success: true, customer: { customerId, name, email, phone, location, pan } });
});

app.post('/api/login', (req, res) => {
    const db = readDB();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const customer = db.customers.find(c => c.email === email && c.is_active);
    if (!customer) return res.status(401).json({ error: 'Invalid credentials' });

    if (simpleHash(password) !== customer.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, customer: { customerId: customer.customer_id, name: customer.full_name, email: customer.email, phone: customer.phone, location: customer.location, pan: customer.pan_number } });
});

app.get('/api/stats', (req, res) => {
    const db = readDB();
    const companies = db.companies.filter(c => c.is_active);
    const products = db.products.filter(p => p.is_active);
    const orders = db.orders;
    
    const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    
    res.json({
        companies: companies.length,
        products: products.length,
        orders: orders.length,
        revenue: revenue
    });
});

// Orders
app.get('/api/orders', (req, res) => {
    const db = readDB();
    const orders = db.orders.map(order => ({
        orderId: order.order_id,
        customer: {
            name: order.customer_name,
            phone: order.customer_phone
        },
        items: db.order_items.filter(item => item.order_id === order.order_id),
        total_amount: order.total_amount,
        created_at: order.created_at,
        customer_location: order.customer_location
    }));
    res.json(orders);
});

// Create order
app.post('/api/orders', (req, res) => {
    const db = readDB();
    const { customerId, customer, items, total } = req.body;
    
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const order = {
        order_id: orderId,
        customer_id: customerId,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_location: customer.location,
        customer_pan: customer.pan,
        total_amount: total,
        order_status: 'completed',
        created_at: new Date().toISOString()
    };
    
    db.orders.push(order);
    
    for (const item of items) {
        db.order_items.push({
            order_id: orderId,
            product_id: item.id,
            product_name: item.name,
            company_name: item.companyName,
            price: item.price,
            weight: item.gram,
            icon_emoji: item.image
        });
    }
    
    writeDB(db);
    res.json({ success: true, orderId });
});

app.post('/api/print-order', (req, res) => {
    res.json({ success: true, message: 'Print disabled on Netlify (serverless)' });
});

module.exports = app;
module.exports.handler = serverless(app);
