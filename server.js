console.log("🔥 server.js execution started");
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/hvac_ims")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

console.log("🚀 Starting HVAC IMS backend...");

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../Frontend')));

// Health API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HVAC IMS Backend is running' });
});

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const users = {
    admin: { password: 'admin123', role: 'admin', name: 'System Administrator' },
    store: { password: 'store123', role: 'store', name: 'Store Manager' },
    production: { password: 'prod123', role: 'production', name: 'Production Supervisor' },
    dispatch: { password: 'dispatch123', role: 'dispatch', name: 'Dispatch Officer' },
    manager: { password: 'manager123', role: 'manager', name: 'Inventory Manager' }
  };

  const user = users[username];

  if (user && user.password === password) {
    return res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        username,
        fullName: user.name,
        role: user.role,
        department: user.role === 'admin' ? 'IT' : 'Inventory'
      }
    });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Mock inventory data
const mockData = {
  rawMaterials: [
    { id: 1, name: 'Filter Media MERV 8', stock: 450 },
    { id: 2, name: 'Filter Media MERV 13', stock: 50 }
  ]
};

app.get('/api/raw-materials', (req, res) => {
  res.json({ success: true, data: mockData.rawMaterials });
});


// Start server
const PORT = process.env.PORT || 5000;

app.use("/api/finished-goods", require("./routes/finishedGoodsRoutes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});
