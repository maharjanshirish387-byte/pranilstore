const express = require('express');
const cors = require('cors');
const { Redis } = require('@upstash/redis');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || 'ADD_YOUR_REDIS_URL_HERE',
  token: process.env.REDIS_TOKEN || ''
});

// Default data
const defaultData = {
  companies: [
    { id: 1, name: "Tech Solutions", logo: "🔧", bgColor: "#667eea", isActive: true },
    { id: 2, name: "Home Essentials", logo: "🏠", bgColor: "#f093fb", isActive: true },
    { id: 3, name: "Fashion Hub", logo: "👔", bgColor: "#4facfe", isActive: true },
    { id: 4, name: "Beauty Care", logo: "💄", bgColor: "#43e97b", isActive: true },
    { id: 5, name: "Sports Gear", logo: "⚽", bgColor: "#fa709a", isActive: true }
  ],
  products: [
    { id: 101, companyId: 1, name: "Wireless Mouse", price: 1299, gram: "120g", stock: 50, image: "🖱️" },
    { id: 102, companyId: 1, name: "Mechanical Keyboard", price: 4999, gram: "980g", stock: 30, image: "⌨️" },
    { id: 103, companyId: 1, name: "USB Hub", price: 899, gram: "85g", stock: 100, image: "🔌" },
    { id: 201, companyId: 2, name: "Kitchen Knife Set", price: 2499, gram: "450g", stock: 25, image: "🔪" },
    { id: 202, companyId: 2, name: "Glass Storage Jars", price: 799, gram: "1200g", stock: 60, image: "🫙" },
    { id: 203, companyId: 2, name: "LED Bulbs Pack", price: 599, gram: "240g", stock: 150, image: "💡" },
    { id: 301, companyId: 3, name: "Cotton T-Shirt", price: 599, gram: "180g", stock: 75, image: "👕" },
    { id: 302, companyId: 3, name: "Denim Jeans", price: 1999, gram: "550g", stock: 40, image: "👖" },
    { id: 303, companyId: 3, name: "Sneakers", price: 2499, gram: "800g", stock: 35, image: "👟" },
    { id: 401, companyId: 4, name: "Face Cream", price: 899, gram: "50g", stock: 80, image: "🧴" },
    { id: 402, companyId: 4, name: "Shampoo", price: 449, gram: "200ml", stock: 100, image: "🧴" },
    { id: 403, companyId: 4, name: "Lipstick", price: 599, gram: "4g", stock: 60, image: "💄" },
    { id: 501, companyId: 5, name: "Yoga Mat", price: 1299, gram: "1200g", stock: 45, image: "🧘" },
    { id: 502, companyId: 5, name: "Dumbbells Set", price: 2999, gram: "5000g", stock: 20, image: "🏋️" },
    { id: 503, companyId: 5, name: "Resistance Bands", price: 799, gram: "150g", stock: 70, image: "🎽" }
  ],
  orders: []
};

// Initialize data if not exists
async function initData() {
  try {
    const companies = await redis.get('companies');
    if (!companies) {
      await redis.set('companies', JSON.stringify(defaultData.companies));
      await redis.set('products', JSON.stringify(defaultData.products));
      await redis.set('orders', JSON.stringify(defaultData.orders));
    }
  } catch (e) {
    console.error('Redis init error:', e.message);
  }
}
initData();

// Helper functions
async function getData(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

async function setData(key, data) {
  try {
    await redis.set(key, JSON.stringify(data));
  } catch (e) {
    console.error('Redis set error:', e.message);
  }
}

// Companies API
app.get('/api/companies', async (req, res) => {
  const companies = await getData('companies');
  res.json(companies.filter(c => c.isActive));
});

app.post('/api/companies', async (req, res) => {
  const companies = await getData('companies');
  const { name, logo, bgColor } = req.body;
  const id = Math.max(...companies.map(c => c.id), 0) + 1;
  const company = { id, name, logo: logo || '🏪', bgColor: bgColor || '#000000', isActive: true };
  companies.push(company);
  await setData('companies', companies);
  res.json(company);
});

app.patch('/api/companies/:id', async (req, res) => {
  const companies = await getData('companies');
  const idx = companies.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  companies[idx] = { ...companies[idx], ...req.body };
  await setData('companies', companies);
  res.json(companies[idx]);
});

app.delete('/api/companies/:id', async (req, res) => {
  const companies = await getData('companies');
  const idx = companies.findIndex(c => c.id === parseInt(req.params.id));
  if (idx !== -1) {
    companies[idx].isActive = false;
    await setData('companies', companies);
  }
  res.json({ success: true });
});

// Products API
app.get('/api/products', async (req, res) => {
  const products = await getData('products');
  const { companyId } = req.query;
  let result = products.filter(p => p.isActive !== false);
  if (companyId) result = result.filter(p => p.companyId === parseInt(companyId));
  res.json(result);
});

app.post('/api/products', async (req, res) => {
  const products = await getData('products');
  const { companyId, name, price, gram, stock, image } = req.body;
  const id = Math.max(...products.map(p => p.id), 100) + 1;
  const product = { id, companyId, name, price, gram, stock, image };
  products.push(product);
  await setData('products', products);
  res.json(product);
});

app.patch('/api/products/:id', async (req, res) => {
  const products = await getData('products');
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products[idx] = { ...products[idx], ...req.body };
  await setData('products', products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', async (req, res) => {
  const products = await getData('products');
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx !== -1) {
    products[idx].isActive = false;
    await setData('products', products);
  }
  res.json({ success: true });
});

// Orders API
app.post('/api/orders', async (req, res) => {
  const orders = await getData('orders');
  const products = await getData('products');
  const { customer, items, total } = req.body;
  
  const order = { id: Date.now(), customer, items, total, createdAt: new Date().toISOString() };
  orders.push(order);
  
  // Decrease stock
  items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product && product.stock > 0) product.stock--;
  });
  
  await setData('orders', orders);
  await setData('products', products);
  res.json({ success: true, orderId: order.id });
});

app.get('/api/orders', async (req, res) => {
  const orders = await getData('orders');
  res.json(orders);
});

// Stats API
app.get('/api/stats', async (req, res) => {
  const companies = await getData('companies');
  const products = await getData('products');
  const orders = await getData('orders');
  res.json({
    companies: companies.filter(c => c.isActive).length,
    products: products.filter(p => p.isActive !== false).length,
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0)
  });
});

module.exports = app;
