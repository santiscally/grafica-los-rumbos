// backend/routes/order.routes.js - REEMPLAZAR TODO
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const filesystemService = require('../services/filesystem.service');

// Rutas públicas
router.post('/', orderController.createOrder);
router.post('/custom', filesystemService.uploadPedido.array('files', 10), orderController.createCustomOrder);

// Rutas protegidas (admin)
router.get('/', authMiddleware, orderController.getOrders);
router.get('/stats', authMiddleware, orderController.getOrderStats);
router.get('/:id/download', authMiddleware, orderController.downloadOrderInfo);
router.get('/:id/files', authMiddleware, orderController.getOrderFiles);
router.get('/:orderId/files/:filename/download', authMiddleware, orderController.downloadOrderFile);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/price', authMiddleware, orderController.updateOrderPrice);
router.delete('/:id', authMiddleware, orderController.cancelOrder);
router.post('/:id/notify', authMiddleware, orderController.sendNotification);

module.exports = router;