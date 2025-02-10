// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002; // Use a distinct port to avoid conflicts

// Paths to our JSON files
const PRIMARY_FILE = path.join(__dirname, 'primary_db.json');
const SECONDARY_FILE = path.join(__dirname, 'secondary_db.json');

// Utility function to read JSON from disk
function loadDB(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { products: [], orders: [], carts: {} };
  }
}

// Load both DBs into memory
let primaryDB = loadDB(PRIMARY_FILE);
let secondaryDB = loadDB(SECONDARY_FILE);

// We'll maintain a queue of replication tasks, so the user gets an
// immediate response after writing to the primary, and we replicate
// to the secondary "later."
let replicationQueue = [];

// Function to write changes to primary DB on disk
function savePrimaryDB() {
  fs.writeFileSync(PRIMARY_FILE, JSON.stringify(primaryDB, null, 2), 'utf-8');
}

// Function to write changes to secondary DB on disk
function saveSecondaryDB() {
  fs.writeFileSync(SECONDARY_FILE, JSON.stringify(secondaryDB, null, 2), 'utf-8');
}

// Periodically process the replication queue (e.g., every 5 seconds)
setInterval(() => {
  if (replicationQueue.length > 0) {
    console.log('Processing replication tasks...');
  }

  while (replicationQueue.length > 0) {
    const task = replicationQueue.shift();

    // Example: "ADD_PRODUCT" or "UPDATE_PRODUCT", etc.
    if (task.type === 'ADD_PRODUCT') {
      secondaryDB.products.push(task.payload);
    }
    else if (task.type === 'UPDATE_PRODUCT') {
      const index = secondaryDB.products.findIndex(p => p.id === task.payload.id);
      if (index !== -1) {
        secondaryDB.products[index] = { ...secondaryDB.products[index], ...task.payload };
      }
    }
    else if (task.type === 'DELETE_PRODUCT') {
      const index = secondaryDB.products.findIndex(p => p.id === task.payload.id);
      if (index !== -1) {
        secondaryDB.products.splice(index, 1);
      }
    }
    // Similarly handle "ADD_ORDER", "ADD_TO_CART", etc.

    // After updating the in-memory secondaryDB, write to disk
    saveSecondaryDB();
  }
}, 5000); // 5-second interval

app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// PRODUCTS - For demonstration, only implementing a few endpoints
// -----------------------------------------------------

// GET /products - read directly from the primary DB
app.get('/products', (req, res) => {
  res.json(primaryDB.products);
});

// POST /products - immediate write to primary, queue for secondary
app.post('/products', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newId = primaryDB.products.length
    ? primaryDB.products[primaryDB.products.length - 1].id + 1
    : 1;
  
  const newProduct = { id: newId, name, description, price, category, inStock };

  // 1) Write to primary DB (in memory)
  primaryDB.products.push(newProduct);

  // 2) Save primary DB to disk
  savePrimaryDB();

  // 3) Add a replication task for the secondary
  replicationQueue.push({ type: 'ADD_PRODUCT', payload: newProduct });

  // 4) Respond immediately (asynchronous replication)
  res.status(201).json(newProduct);
});

// PUT /products/:id - update in primary, queue replication
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = primaryDB.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Update the product in primary DB
  primaryDB.products[index] = { ...primaryDB.products[index], ...req.body };
  savePrimaryDB();

  // Add an "UPDATE_PRODUCT" task to replicate changes
  replicationQueue.push({
    type: 'UPDATE_PRODUCT',
    payload: primaryDB.products[index],
  });

  res.json(primaryDB.products[index]);
});

// DELETE /products/:id - remove from primary, queue for secondary
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = primaryDB.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Grab the product so we know the ID in the replication task
  const removedProduct = primaryDB.products[index];
  primaryDB.products.splice(index, 1);
  savePrimaryDB();

  replicationQueue.push({ type: 'DELETE_PRODUCT', payload: removedProduct });

  res.json({ message: 'Product removed from primary. Will replicate asynchronously.' });
});

// (You would similarly adapt Orders and Cart with tasks: "ADD_ORDER", "ADD_TO_CART", etc.)

// -----------------------------------------------------
// Start the server
app.listen(PORT, () => {
  console.log(`Asynchronous Replication server running on http://localhost:${PORT}`);
});
