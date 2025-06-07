const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const gridFSService = require('../services/gridfs.service');

// Rutas públicas
router.post('/', orderController.createOrder);
router.post('/custom', gridFSService.upload.array('files', 10), orderController.createCustomOrder);

// Rutas protegidas (admin)
router.get('/', authMiddleware, orderController.getOrders);
router.get('/stats', authMiddleware, orderController.getOrderStats);
router.get('/:id/files', authMiddleware, orderController.getOrderFiles);
router.get('/:orderId/files/:fileId/download', authMiddleware, orderController.downloadOrderFile);
router.put('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.put('/:id/price', authMiddleware, orderController.updateOrderPrice);
router.delete('/:id', authMiddleware, orderController.cancelOrder);
router.post('/:id/notify', authMiddleware, orderController.sendNotification);

module.exports = router;