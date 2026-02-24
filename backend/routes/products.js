const express = require('express');
const router = express.Router();

// In-memory products data (mirrors data.js on the frontend)
const products = [
    { product_id: 101, company_id: 1, product_name: "Wireless Mouse",      price: 1299, weight: "120g",   stock_quantity: 50,  icon_emoji: "🖱️",  is_active: true },
    { product_id: 102, company_id: 1, product_name: "Mechanical Keyboard", price: 4999, weight: "980g",   stock_quantity: 30,  icon_emoji: "⌨️",  is_active: true },
    { product_id: 103, company_id: 1, product_name: "USB Hub",             price: 899,  weight: "85g",    stock_quantity: 100, icon_emoji: "🔌",  is_active: true },
    { product_id: 201, company_id: 2, product_name: "Kitchen Knife Set",   price: 2499, weight: "450g",   stock_quantity: 25,  icon_emoji: "🔪",  is_active: true },
    { product_id: 202, company_id: 2, product_name: "Glass Storage Jars",  price: 799,  weight: "1200g",  stock_quantity: 60,  icon_emoji: "🫙",  is_active: true },
    { product_id: 203, company_id: 2, product_name: "LED Bulbs Pack",      price: 599,  weight: "240g",   stock_quantity: 150, icon_emoji: "💡",  is_active: true },
    { product_id: 301, company_id: 3, product_name: "Cotton T-Shirt",      price: 599,  weight: "180g",   stock_quantity: 75,  icon_emoji: "👕",  is_active: true },
    { product_id: 302, company_id: 3, product_name: "Denim Jeans",         price: 1999, weight: "550g",   stock_quantity: 40,  icon_emoji: "👖",  is_active: true },
    { product_id: 303, company_id: 3, product_name: "Sneakers",            price: 2499, weight: "800g",   stock_quantity: 35,  icon_emoji: "👟",  is_active: true },
    { product_id: 401, company_id: 4, product_name: "Face Cream",          price: 899,  weight: "50g",    stock_quantity: 80,  icon_emoji: "🧴",  is_active: true },
    { product_id: 402, company_id: 4, product_name: "Shampoo",             price: 449,  weight: "200ml",  stock_quantity: 100, icon_emoji: "🧴",  is_active: true },
    { product_id: 403, company_id: 4, product_name: "Lipstick",            price: 599,  weight: "4g",     stock_quantity: 60,  icon_emoji: "💄",  is_active: true },
    { product_id: 501, company_id: 5, product_name: "Yoga Mat",            price: 1299, weight: "1200g",  stock_quantity: 45,  icon_emoji: "🧘",  is_active: true },
    { product_id: 502, company_id: 5, product_name: "Dumbbells Set",       price: 2999, weight: "5000g",  stock_quantity: 20,  icon_emoji: "🏋️", is_active: true },
    { product_id: 503, company_id: 5, product_name: "Resistance Bands",    price: 799,  weight: "150g",   stock_quantity: 70,  icon_emoji: "🎽",  is_active: true },
    { product_id: 601, company_id: 6, product_name: "Fiction Novel",       price: 399,  weight: "350g",   stock_quantity: 90,  icon_emoji: "📖",  is_active: true },
    { product_id: 602, company_id: 6, product_name: "Cookbook",            price: 699,  weight: "600g",   stock_quantity: 50,  icon_emoji: "📕",  is_active: true },
    { product_id: 603, company_id: 6, product_name: "Self-Help Guide",     price: 499,  weight: "280g",   stock_quantity: 65,  icon_emoji: "📗",  is_active: true },
    { product_id: 701, company_id: 7, product_name: "Dog Food",            price: 1499, weight: "3000g",  stock_quantity: 40,  icon_emoji: "🦴",  is_active: true },
    { product_id: 702, company_id: 7, product_name: "Cat Toy",             price: 299,  weight: "50g",    stock_quantity: 85,  icon_emoji: "🐱",  is_active: true },
    { product_id: 703, company_id: 7, product_name: "Pet Bed",             price: 1999, weight: "1500g",  stock_quantity: 25,  icon_emoji: "🛏️", is_active: true },
    { product_id: 801, company_id: 8, product_name: "Plant Seeds",         price: 199,  weight: "20g",    stock_quantity: 150, icon_emoji: "🌾",  is_active: true },
    { product_id: 802, company_id: 8, product_name: "Watering Can",        price: 599,  weight: "400g",   stock_quantity: 55,  icon_emoji: "💧",  is_active: true },
    { product_id: 803, company_id: 8, product_name: "Garden Gloves",       price: 299,  weight: "100g",   stock_quantity: 70,  icon_emoji: "🧤",  is_active: true },
    { product_id: 901, company_id: 9, product_name: "Baby Bottle",         price: 399,  weight: "150g",   stock_quantity: 80,  icon_emoji: "🍼",  is_active: true },
    { product_id: 902, company_id: 9, product_name: "Diapers Pack",        price: 899,  weight: "2000g",  stock_quantity: 60,  icon_emoji: "🧷",  is_active: true },
    { product_id: 903, company_id: 9, product_name: "Baby Wipes",          price: 249,  weight: "500g",   stock_quantity: 100, icon_emoji: "🧻",  is_active: true },
    { product_id: 1001, company_id: 10, product_name: "Notebook",          price: 149,  weight: "200g",   stock_quantity: 120, icon_emoji: "📓",  is_active: true },
    { product_id: 1002, company_id: 10, product_name: "Pen Set",           price: 299,  weight: "80g",    stock_quantity: 90,  icon_emoji: "🖊️", is_active: true },
    { product_id: 1003, company_id: 10, product_name: "Desk Organizer",    price: 799,  weight: "600g",   stock_quantity: 45,  icon_emoji: "📋",  is_active: true }
];

// GET /api/products  — all products (optionally filter by ?company_id=X)
router.get('/', (req, res) => {
    let result = products.filter(p => p.is_active);
    if (req.query.company_id) {
        const cid = parseInt(req.query.company_id);
        result = result.filter(p => p.company_id === cid);
    }
    res.json(result);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.product_id === id && p.is_active);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// POST /api/products  (admin: add product)
router.post('/', (req, res) => {
    const { company_id, product_name, price, weight, stock_quantity, icon_emoji } = req.body;
    if (!company_id || !product_name || price == null) {
        return res.status(400).json({ error: 'company_id, product_name, and price are required' });
    }
    const newId = products.reduce((max, p) => Math.max(max, p.product_id), 0) + 1;
    const product = {
        product_id: newId,
        company_id: parseInt(company_id),
        product_name,
        price: parseFloat(price),
        weight: weight || '',
        stock_quantity: parseInt(stock_quantity) || 0,
        icon_emoji: icon_emoji || '',
        is_active: true
    };
    products.push(product);
    res.status(201).json(product);
});

// PATCH /api/products/:id  (admin: update stock or details)
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.product_id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const allowed = ['product_name', 'price', 'weight', 'stock_quantity', 'icon_emoji'];
    allowed.forEach(field => {
        if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    res.json(product);
});

// DELETE /api/products/:id  (admin: soft-delete)
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.product_id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.is_active = false;
    res.json({ success: true });
});

module.exports = router;