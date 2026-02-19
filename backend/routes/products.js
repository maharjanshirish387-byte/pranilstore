const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await db.select('products', { is_active: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.findOne('products', { product_id: parseInt(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { product_id, company_id, product_name, price, weight, stock_quantity, icon_emoji, is_active } = req.body;
    await db.insert('products', { product_id, company_id, product_name, price, weight, stock_quantity, icon_emoji, is_active });
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    await db.update('products', { product_id: parseInt(req.params.id) }, req.body);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    await db.update('products', { product_id: parseInt(req.params.id) }, { is_active: false });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
