const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await db.select('companies');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single company by ID
router.get('/:id', async (req, res) => {
  try {
    const company = await db.findOne('companies', { company_id: parseInt(req.params.id) });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new company
router.post('/', async (req, res) => {
  try {
    const { company_id, company_name, logo_url, background_color, is_active } = req.body;
    await db.insert('companies', { company_id, company_name, logo_url, background_color, is_active });
    res.status(201).json({ message: 'Company created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a company
router.put('/:id', async (req, res) => {
  try {
    await db.update('companies', { company_id: parseInt(req.params.id) }, req.body);
    res.json({ message: 'Company updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a company
router.delete('/:id', async (req, res) => {
  try {
    await db.update('companies', { company_id: parseInt(req.params.id) }, { is_active: false });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
