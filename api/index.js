const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function for hashing passwords
function hashPassword(password) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ==================== COMPANIES ====================

app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE is_active = true ORDER BY company_id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/companies/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE company_id = $1 AND is_active = true',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { company_name, logo_url, background_color, description } = req.body;
    const result = await pool.query(
      `INSERT INTO companies (company_name, logo_url, background_color, description) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [company_name, logo_url, background_color || '#000000', description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.patch('/api/companies/:id', async (req, res) => {
  try {
    const { company_name, logo_url, background_color, description } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (company_name) { fields.push(`company_name = $${idx++}`); values.push(company_name); }
    if (logo_url) { fields.push(`logo_url = $${idx++}`); values.push(logo_url); }
    if (background_color) { fields.push(`background_color = $${idx++}`); values.push(background_color); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE companies SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE company_id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE companies SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE company_id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// ==================== PRODUCTS ====================

app.get('/api/products', async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = 'SELECT p.*, c.company_name FROM products p JOIN companies c ON p.company_id = c.company_id WHERE p.is_active = true';
    const values = [];

    if (company_id) {
      values.push(company_id);
      query += ` AND p.company_id = $${values.length}`;
    }

    query += ' ORDER BY p.product_id';
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, c.company_name FROM products p JOIN companies c ON p.company_id = c.company_id WHERE p.product_id = $1 AND p.is_active = true',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { company_id, product_name, description, price, weight, stock_quantity, icon_emoji, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (company_id, product_name, description, price, weight, stock_quantity, icon_emoji, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [company_id, product_name, description, price, weight, stock_quantity || 0, icon_emoji, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.patch('/api/products/:id', async (req, res) => {
  try {
    const { product_name, description, price, weight, stock_quantity, icon_emoji, image_url } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (product_name) { fields.push(`product_name = $${idx++}`); values.push(product_name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (weight) { fields.push(`weight = $${idx++}`); values.push(weight); }
    if (stock_quantity !== undefined) { fields.push(`stock_quantity = $${idx++}`); values.push(stock_quantity); }
    if (icon_emoji) { fields.push(`icon_emoji = $${idx++}`); values.push(icon_emoji); }
    if (image_url) { fields.push(`image_url = $${idx++}`); values.push(image_url); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE product_id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE product_id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== AUTH ====================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, location, pan, password } = req.body;
    
    if (!email || !password || !name || !phone || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await pool.query('SELECT customer_id FROM customers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = hashPassword(password);
    const result = await pool.query(
      `INSERT INTO customers (email, password_hash, full_name, phone, location, pan_number) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING customer_id, email, full_name, phone, location, pan_number`,
      [email, passwordHash, name, phone, location, pan || null]
    );

    const customer = result.rows[0];
    res.json({ 
      success: true, 
      customer: { 
        customerId: customer.customer_id, 
        name: customer.full_name, 
        email: customer.email, 
        phone: customer.phone, 
        location: customer.location, 
        pan: customer.pan_number 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const passwordHash = hashPassword(password);
    const result = await pool.query(
      'SELECT * FROM customers WHERE email = $1 AND password_hash = $2 AND is_active = true',
      [email, passwordHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE customer_id = $1',
      [result.rows[0].customer_id]
    );

    const customer = result.rows[0];
    res.json({ 
      success: true, 
      customer: { 
        customerId: customer.customer_id, 
        name: customer.full_name, 
        email: customer.email, 
        phone: customer.phone, 
        location: customer.location, 
        pan: customer.pan_number 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== ORDERS ====================

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, customer, items, total } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `INSERT INTO orders (customer_id, customer_name, customer_phone, customer_location, customer_pan, total_amount, order_status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'completed') RETURNING order_id`,
        [customerId, customer.name, customer.phone, customer.location, customer.pan || null, total]
      );
      
      const orderId = orderResult.rows[0].order_id;

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, company_name, price, quantity, weight, icon_emoji) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [orderId, item.id, item.name, item.companyName, item.price, 1, item.gram, item.image]
        );

        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = $1',
          [item.id]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, orderId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, c.full_name as customer_name_full 
       FROM orders o 
       LEFT JOIN customers c ON o.customer_id = c.customer_id 
       ORDER BY o.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id/items', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

// ==================== STATS ====================

app.get('/api/stats', async (req, res) => {
  try {
    const companies = await pool.query('SELECT COUNT(*) as count FROM companies WHERE is_active = true');
    const products = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = true');
    const orders = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders');
    const lowStock = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity > 0 AND stock_quantity <= 10 AND is_active = true');

    res.json({
      companies: parseInt(companies.rows[0].count),
      products: parseInt(products.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      revenue: parseFloat(orders.rows[0].revenue),
      lowStock: parseInt(lowStock.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/print-order', (req, res) => {
  res.json({ success: true, message: 'Order received' });
});

module.exports = app;
