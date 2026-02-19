const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5500';
app.use(cors({ 
    origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN,
    credentials: true 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pranil_ecommerce'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Database connected successfully');
});

// Make db available to routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Routes
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });

// Start server

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Print endpoint - accepts order text or structured order and prints on server's printer
const { printText } = require('./print');

// Printer name can be configured via environment variable PRINT_PRINTER_NAME
const DEFAULT_PRINTER = process.env.PRINT_PRINTER_NAME || '';

app.post('/api/print-order', async (req, res) => {
    const { text, order } = req.body || {};

    if (!text && !order) {
        return res.status(400).json({ error: 'Missing text or order payload to print' });
    }

    // If structured order provided, compose a simple text receipt
    let printBody = text;
    if (!printBody && order) {
        try {
            const date = new Date(order.date || Date.now()).toLocaleString();
            printBody = `ORDER RECEIPT\nOrder ID: ${order.orderId || 'N/A'}\nDate: ${date}\n\nCustomer:\n${order.customer?.name || ''}\n${order.customer?.phone || ''}\n${order.customer?.location || ''}\n\nITEMS:\n`;
            (order.items || []).forEach((it, i) => {
                printBody += `\n${i+1}. ${it.name} - NPR ${it.price}\n   Company: ${it.companyName || ''}\n   Weight: ${it.gram || ''}\n`;
            });
            printBody += `\nTOTAL: NPR ${order.total || 0}\n\nThank you`;
        } catch (e) {
            printBody = JSON.stringify(order, null, 2);
        }
    }

    try {
        const printerName = req.body.printerName || DEFAULT_PRINTER;
        await printText(printBody, printerName);
        res.json({ success: true });
    } catch (err) {
        console.error('Print failed:', err);
        res.status(500).json({ error: 'Failed to print', details: err.message });
    }
});

// -------------------------
// AUTH: Register / Login
// -------------------------

app.post('/api/register', async (req, res) => {
    const { name, email, phone, location, pan, password } = req.body || {};
    if (!email || !password || !name || !phone || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // check existing email
        db.query('SELECT * FROM customers WHERE email = ? LIMIT 1', [email], async (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) return res.status(409).json({ error: 'Email already registered' });

            // check phone
            db.query('SELECT * FROM customers WHERE phone = ? LIMIT 1', [phone], async (err2, results2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                if (results2.length > 0) return res.status(409).json({ error: 'Phone already registered' });

                const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
                const customerId = `CUST-${Date.now()}-${Math.floor(Math.random()*1000)}`;

                const insertSql = `INSERT INTO customers (customer_id, email, password_hash, full_name, phone, location, pan_number, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`;
                db.query(insertSql, [customerId, email, passwordHash, name, phone, location, pan || null], (insErr) => {
                    if (insErr) return res.status(500).json({ error: insErr.message });

                    const token = jwt.sign({ customer_id: customerId }, JWT_SECRET, { expiresIn: '7d' });
                    return res.json({ success: true, token, customer: { customerId, name, email, phone, location, pan } });
                });
            });
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    db.query('SELECT * FROM customers WHERE email = ? AND is_active = TRUE LIMIT 1', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const customer = results[0];
        const match = await bcrypt.compare(password, customer.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        // update last_login
        db.query('UPDATE customers SET last_login = NOW() WHERE customer_id = ?', [customer.customer_id], () => {});

        const token = jwt.sign({ customer_id: customer.customer_id }, JWT_SECRET, { expiresIn: '7d' });

        return res.json({ success: true, token, customer: { customerId: customer.customer_id, name: customer.full_name, email: customer.email, phone: customer.phone, location: customer.location, pan: customer.pan_number } });
    });
});