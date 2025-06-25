// backend/controllers/file.controller.js - REEMPLAZAR TODO
const path = require('path');
const fs = require('fs').promises;
const filesystemService = require('../services/filesystem.service');

const fileController = {
  // Subir imagen de producto
  async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
      }
      
      // El productId se enviará en el body
      const { productId } = req.body;
      
      if (!productId) {
        // Si no hay productId, es un archivo temporal
        return res.status(200).json({
          tempFile: req.file.filename,
          originalname: req.file.originalname
        });
      }
      
      // Mover archivo a su ubicación final
      const imageInfo = await filesystemService.moveImageToProducto(req.file, productId);
      
      res.status(201).json({
        success: true,
        filename: imageInfo.filename,
        url: `/api/files/product/${productId}`
      });
    } catch (error) {
      console.error('Error uploading product image:', error);
      res.status(500).json({ message: 'Error al subir imagen', error: error.message });
    }
  },

  // Obtener imagen de producto
  async getProductImage(req, res) {
    try {
      const productId = req.params.id;
      const imagePath = await filesystemService.getProductoImage(productId);
      
      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(imagePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Configurar headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Enviar archivo
      const imageBuffer = await fs.readFile(imagePath);
      res.send(imageBuffer);
      
    } catch (error) {
      console.error('Error getting product image:', error);
      res.status(404).json({ message: 'Imagen no encontrada' });
    }
  },

  // Eliminar imagen de producto
  async deleteProductImage(req, res) {
    try {
      const productId = req.params.id;
      await filesystemService.deleteProductoImage(productId);
      res.json({ message: 'Imagen eliminada exitosamente' });
    } catch (error) {
      console.error('Error deleting product image:', error);
      res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
    }
  },

  // Obtener archivo de pedido
  async getOrderFile(req, res) {
    try {
      const { orderId, filename } = req.params;
      const filePath = await filesystemService.getPedidoFile(orderId, filename);
      
      // Determinar el tipo MIME
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Enviar archivo
      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
      
    } catch (error) {
      console.error('Error getting order file:', error);
      res.status(404).json({ message: 'Archivo no encontrado' });
    }
  }
};

module.exports = fileController;