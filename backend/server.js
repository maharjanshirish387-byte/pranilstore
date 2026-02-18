const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Add password verification here
        res.json({ success: true, user: results[0] });
    });
});

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