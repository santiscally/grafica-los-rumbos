// backend/routes/order.routes.js - REEMPLAZAR TODO

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/', orderController.createOrder);

// Rutas protegidas (admin)
router.get('/', authMiddleware, orderController.getOrders);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/price', authMiddleware, orderController.updateOrderPrice);
router.delete('/:id', authMiddleware, orderController.cancelOrder);
router.post('/:id/notify', authMiddleware, orderController.sendNotification);

module.exports = router;