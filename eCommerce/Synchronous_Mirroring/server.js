// Synchronous_Mirroring/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001; // different from your Basic_Implementation

// Paths to two JSON files
const PRIMARY_FILE = path.join(__dirname, 'primary_db.json');
const SECONDARY_FILE = path.join(__dirname, 'secondary_db.json');

// Load data from disk
function loadDB(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { products: [], orders: [], carts: {} };
  }
}

let primaryDB = loadDB(PRIMARY_FILE);
let secondaryDB = loadDB(SECONDARY_FILE);

app.use(cors());
app.use(express.json());

// Utility to write data to both JSON files
function saveData() {
  // Write to primary
  fs.writeFileSync(PRIMARY_FILE, JSON.stringify(primaryDB, null, 2), 'utf-8');
  // Write to secondary
  fs.writeFileSync(SECONDARY_FILE, JSON.stringify(secondaryDB, null, 2), 'utf-8');
}

// ------------------------------------
// PRODUCTS
// ------------------------------------
app.get('/products', (req, res) => {
  res.json(primaryDB.products); // read from primary
});

app.post('/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  const newId = primaryDB.products.length
    ? primaryDB.products[primaryDB.products.length - 1].id + 1
    : 1;

  const newProduct = {
    id: newId,
    name,
    description,
    price,
    category,
    inStock
  };

  // Write to primary
  primaryDB.products.push(newProduct);
  // Write to secondary
  secondaryDB.products.push(newProduct);

  // Synchronously save to both files
  try {
    saveData();
    res.status(201).json(newProduct);
  } catch (error) {
    // If writing to secondary fails, we might do a rollback:
    // primaryDB.products.pop();
    // secondaryDB.products.pop();
    res.status(500).json({ error: 'Synchronous write failed.' });
  }
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const product = primaryDB.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pIndex = primaryDB.products.findIndex(p => p.id === id);

  if (pIndex === -1) return res.status(404).json({ error: 'Product not found' });

  // Update data in memory (primary and secondary)
  primaryDB.products[pIndex] = { ...primaryDB.products[pIndex], ...req.body };
  const newData = primaryDB.products[pIndex];

  // For secondary, find the same product
  const sIndex = secondaryDB.products.findIndex(p => p.id === id);
  secondaryDB.products[sIndex] = { ...secondaryDB.products[sIndex], ...req.body };

  try {
    saveData();
    res.json(newData);
  } catch (error) {
    res.status(500).json({ error: 'Synchronous update failed.' });
  }
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pIndex = primaryDB.products.findIndex(p => p.id === id);
  if (pIndex === -1) return res.status(404).json({ error: 'Product not found' });

  // Remove from primary
  primaryDB.products.splice(pIndex, 1);

  // Remove from secondary as well
  const sIndex = secondaryDB.products.findIndex(p => p.id === id);
  secondaryDB.products.splice(sIndex, 1);

  try {
    saveData();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Synchronous delete failed.' });
  }
});

// ------------------------------------
// ORDERS
// (similar approach: always write to both DBs, then call saveData())
// ------------------------------------

// POST /orders
app.post('/orders', (req, res) => {
  const { userId, items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }

  let totalPrice = 0;
  const orderProducts = [];
  items.forEach(({ productId, quantity }) => {
    const product = primaryDB.products.find(p => p.id === productId);
    if (product) {
      orderProducts.push({ product, quantity });
      totalPrice += product.price * quantity;
    }
  });

  const newOrderId = primaryDB.orders.length
    ? primaryDB.orders[primaryDB.orders.length - 1].orderId + 1
    : 1;

  const newOrder = {
    orderId: newOrderId,
    userId: userId || null,
    items: orderProducts,
    totalPrice,
    status: 'Pending'
  };

  // Write to both
  primaryDB.orders.push(newOrder);
  secondaryDB.orders.push(newOrder);

  try {
    saveData();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Could not create order synchronously.' });
  }
});

// GET /orders/:userId
app.get('/orders/:userId', (req, res) => {
  const userOrders = primaryDB.orders.filter(o => String(o.userId) === req.params.userId);
  res.json(userOrders);
});

// ------------------------------------
// CART
// same pattern
// ------------------------------------

// Start the server
app.listen(PORT, () => {
  console.log(`Synchronous Mirroring server running on http://localhost:${PORT}`);
});
