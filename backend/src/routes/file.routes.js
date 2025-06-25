// backend/routes/file.routes.js - REEMPLAZAR TODO
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const filesystemService = require('../services/filesystem.service');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas para archivos de productos
router.post('/product', authMiddleware, filesystemService.uploadProducto.single('file'), fileController.uploadProductImage);
router.get('/product/:id', fileController.getProductImage);
router.delete('/product/:id', authMiddleware, fileController.deleteProductImage);

// Rutas para archivos de pedidos
router.get('/order/:orderId/:filename', authMiddleware, fileController.getOrderFile);

module.exports = router;