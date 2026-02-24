const express = require('express');
const router = express.Router();

// In-memory company + product data (mirrors data.js on the frontend)
const companies = [
    { company_id: 1, company_name: "Tech Solutions",    logo_url: "🔧", background_color: "#667eea", is_active: true },
    { company_id: 2, company_name: "Home Essentials",   logo_url: "🏠", background_color: "#f093fb", is_active: true },
    { company_id: 3, company_name: "Fashion Hub",       logo_url: "👔", background_color: "#4facfe", is_active: true },
    { company_id: 4, company_name: "Beauty Care",       logo_url: "💄", background_color: "#43e97b", is_active: true },
    { company_id: 5, company_name: "Sports Gear",       logo_url: "⚽", background_color: "#fa709a", is_active: true },
    { company_id: 6, company_name: "Books Corner",      logo_url: "📚", background_color: "#30cfd0", is_active: true },
    { company_id: 7, company_name: "Pet Paradise",      logo_url: "🐾", background_color: "#a8edea", is_active: true },
    { company_id: 8, company_name: "Garden Tools",      logo_url: "🌱", background_color: "#ff9a56", is_active: true },
    { company_id: 9, company_name: "Baby World",        logo_url: "👶", background_color: "#2e2e78", is_active: true },
    { company_id: 10, company_name: "Office Supplies",  logo_url: "📎", background_color: "#000000", is_active: true }
];

// GET /api/companies
router.get('/', (req, res) => {
    res.json(companies.filter(c => c.is_active));
});

// GET /api/companies/:id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const company = companies.find(c => c.company_id === id && c.is_active);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
});

// POST /api/companies  (admin: add company)
router.post('/', (req, res) => {
    const { company_name, logo_url, background_color } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name required' });
    const newId = companies.reduce((max, c) => Math.max(max, c.company_id), 0) + 1;
    const company = {
        company_id: newId,
        company_name,
        logo_url: logo_url || '',
        background_color: background_color || '#000000',
        is_active: true
    };
    companies.push(company);
    res.status(201).json(company);
});

// PATCH /api/companies/:id  (admin: update company)
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const company = companies.find(c => c.company_id === id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const allowed = ['company_name', 'logo_url', 'background_color'];
    allowed.forEach(field => {
        if (req.body[field] !== undefined) company[field] = req.body[field];
    });
    res.json(company);
});

// DELETE /api/companies/:id  (admin: soft-delete)
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const company = companies.find(c => c.company_id === id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    company.is_active = false;
    res.json({ success: true });
});

module.exports = router;