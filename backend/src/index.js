// backend/src/index.js - ARCHIVO COMPLETO
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const fileRoutes = require('./routes/file.routes');
const priceRoutes = require('./routes/price.routes');
const filesystemService = require('./services/filesystem.service');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:80', 'http://149.50.142.57:3000', 'http://149.50.142.57:80'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Inicializar sistema de archivos
  await filesystemService.initializeDirectories();
  
  // Inicializar base de datos
  const initializeDatabase = require('./scripts/init');
  await initializeDatabase();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/prices', priceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});