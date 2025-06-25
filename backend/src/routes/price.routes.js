// backend/routes/price.routes.js
const express = require('express');
const router = express.Router();
const priceController = require('../controllers/price.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', priceController.getPrices);

// Rutas protegidas (admin)
router.post('/', authMiddleware, priceController.createPrice);
router.get('/:id', authMiddleware, priceController.getPriceById);
router.put('/:id', authMiddleware, priceController.updatePrice);
router.delete('/:id', authMiddleware, priceController.deletePrice);

module.exports = router;