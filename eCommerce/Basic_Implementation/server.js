// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Path to JSON database file
const DB_FILE = path.join(__dirname, 'db.json');

// Load data once at startup
function loadData() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Could not read db.json, returning default structure.');
    return { products: [], orders: [], carts: {} };
  }
}

// Write data back to disk
function saveData(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// In-memory data
let db = loadData();

app.use(cors());
app.use(express.json());

// ------------------
// PRODUCTS
// ------------------
app.get('/products', (req, res) => {
  const { category, inStock } = req.query;
  let filtered = [...db.products];
  
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (inStock !== undefined) {
    filtered = filtered.filter(p => String(p.inStock) === inStock);
  }
  
  res.json(filtered);
});

app.get('/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newId = db.products.length ? db.products[db.products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, description, price, category, inStock };

  db.products.push(newProduct);
  saveData(db);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  // Update fields
  db.products[index] = { ...db.products[index], ...req.body };
  saveData(db);
  res.json(db.products[index]);
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  db.products.splice(index, 1);
  saveData(db);
  res.json({ message: 'Product deleted successfully' });
});

// ------------------
// ORDERS
// ------------------
app.post('/orders', (req, res) => {
  // body: { userId, items: [{ productId, quantity }] }
  const { userId, items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }
  
  let totalPrice = 0;
  const orderProducts = [];
  
  items.forEach(({ productId, quantity }) => {
    const product = db.products.find(p => p.id === productId);
    if (product) {
      orderProducts.push({ product, quantity });
      totalPrice += product.price * quantity;
    }
  });
  
  const orderId = db.orders.length ? db.orders[db.orders.length - 1].orderId + 1 : 1;
  const newOrder = {
    orderId,
    userId: userId || null,
    items: orderProducts,
    totalPrice,
    status: 'Pending'
  };
  
  db.orders.push(newOrder);
  saveData(db);
  res.status(201).json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
  const userOrders = db.orders.filter(o => String(o.userId) === req.params.userId);
  res.json(userOrders);
});

// ------------------
// CART
// ------------------
app.post('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  
  if (!db.carts[userId]) db.carts[userId] = [];
  
  const itemIndex = db.carts[userId].findIndex(i => i.productId === productId);
  if (itemIndex > -1) {
    db.carts[userId][itemIndex].quantity += quantity;
  } else {
    db.carts[userId].push({ productId, quantity });
  }
  
  saveData(db);
  res.json(db.carts[userId]);
});

app.get('/cart/:userId', (req, res) => {
  const cart = db.carts[req.params.userId] || [];
  // optionally calculate total price, or do that in front-end
  res.json(cart);
});

app.delete('/cart/:userId/item/:productId', (req, res) => {
  const { userId, productId } = req.params;
  if (!db.carts[userId]) return res.json([]); // or 404 if you prefer
  
  db.carts[userId] = db.carts[userId].filter(i => i.productId !== parseInt(productId));
  saveData(db);
  res.json(db.carts[userId]);
});

app.listen(PORT, () => {
  console.log(`E-commerce API running on http://localhost:${PORT}`);
});
