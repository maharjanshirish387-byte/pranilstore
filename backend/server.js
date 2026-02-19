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


// API routes for companies and products
const companiesRouter = require('./routes/companies');
const productsRouter = require('./routes/products');
app.use('/api/companies', companiesRouter);
app.use('/api/products', productsRouter);

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
