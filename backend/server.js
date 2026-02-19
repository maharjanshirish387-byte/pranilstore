const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for Netlify (replaces MySQL)
const db = {
    customers: [],
    orders: []
};

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const BCRYPT_ROUNDS = 10;

// Simple hash function (not secure for production, use bcrypt in real apps)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function compareHash(str, hash) {
    return simpleHash(str) === hash;
}

// Routes
app.get('/api/products', (req, res) => {
    const products = [
        { id: 101, company_id: 1, product_name: "Wireless Mouse", price: 1299, weight: "120g", stock_quantity: 50 },
        { id: 102, company_id: 1, product_name: "Mechanical Keyboard", price: 4999, weight: "980g", stock_quantity: 30 },
        { id: 103, company_id: 1, product_name: "USB Hub", price: 899, weight: "85g", stock_quantity: 100 },
        { id: 201, company_id: 2, product_name: "Kitchen Knife Set", price: 2499, weight: "450g", stock_quantity: 25 },
        { id: 202, company_id: 2, product_name: "Glass Storage Jars", price: 799, weight: "1200g", stock_quantity: 60 },
        { id: 203, company_id: 2, product_name: "LED Bulbs Pack", price: 599, weight: "240g", stock_quantity: 150 },
        { id: 301, company_id: 3, product_name: "Cotton T-Shirt", price: 599, weight: "180g", stock_quantity: 75 },
        { id: 302, company_id: 3, product_name: "Denim Jeans", price: 1999, weight: "550g", stock_quantity: 40 },
        { id: 303, company_id: 3, product_name: "Sneakers", price: 2499, weight: "800g", stock_quantity: 35 },
        { id: 401, company_id: 4, product_name: "Face Cream", price: 899, weight: "50g", stock_quantity: 80 },
        { id: 402, company_id: 4, product_name: "Shampoo", price: 449, weight: "200ml", stock_quantity: 100 },
        { id: 403, company_id: 4, product_name: "Lipstick", price: 599, weight: "4g", stock_quantity: 60 },
        { id: 501, company_id: 5, product_name: "Yoga Mat", price: 1299, weight: "1200g", stock_quantity: 45 },
        { id: 502, company_id: 5, product_name: "Dumbbells Set", price: 2999, weight: "5000g", stock_quantity: 20 },
        { id: 503, company_id: 5, product_name: "Resistance Bands", price: 799, weight: "150g", stock_quantity: 70 }
    ];
    res.json(products);
});

app.post('/api/register', (req, res) => {
    const { name, email, phone, location, pan, password } = req.body || {};
    if (!email || !password || !name || !phone || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = db.customers.find(c => c.email === email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const existingPhone = db.customers.find(c => c.phone === phone);
    if (existingPhone) return res.status(409).json({ error: 'Phone already registered' });

    const customerId = `CUST-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const passwordHash = simpleHash(password);

    const customer = {
        customer_id: customerId,
        email,
        password_hash: passwordHash,
        full_name: name,
        phone,
        location,
        pan_number: pan || null,
        is_active: true,
        created_at: new Date().toISOString()
    };

    db.customers.push(customer);

    const token = JWT_SECRET + '.' + customerId;
    res.json({ success: true, token, customer: { customerId, name, email, phone, location, pan } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const customer = db.customers.find(c => c.email === email && c.is_active);
    if (!customer) return res.status(401).json({ error: 'Invalid credentials' });

    const match = compareHash(password, customer.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = JWT_SECRET + '.' + customer.customer_id;
    res.json({ success: true, token, customer: { customerId: customer.customer_id, name: customer.full_name, email: customer.email, phone: customer.phone, location: customer.location, pan: customer.pan_number } });
});

app.post('/api/print-order', (req, res) => {
    res.json({ success: true, message: 'Print disabled on Netlify (serverless)' });
});

module.exports = app;
module.exports.handler = serverless(app);
