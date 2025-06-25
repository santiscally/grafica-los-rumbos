// controllers/product.controller.js
const Product = require('../models/product.model');

const productController = {
// Modificación en product.controller.js - método getProducts
  async getProducts(req, res) {
    try {
      const { year, subject } = req.query;
      
      const query = {};
      if (year) query.year = year;
      if (subject) query.subject = subject;
      
      const products = await Product.find(query);
      
      // Transformar productos para incluir URL explícita de imagen
      const transformedProducts = products.map(product => {
        const productObj = product.toObject({ virtuals: true });
        // Asegurarse que imageUrl esté presente y correcto
        if (!productObj.imageUrl && productObj.image) {
          productObj.imageUrl = `/api/files/${productObj.image}`;
        }
        return productObj;
      });
      
      res.json(transformedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

async createProduct(req, res) {
    try {
      const product = new Product({
        ...req.body,
        hasImage: false // Se actualizará cuando se suba la imagen
      });
      
      await product.save();
      
      // Si hay una imagen temporal, moverla
      if (req.body.tempFile) {
        try {
          await filesystemService.moveImageToProducto(
            { path: `/app/productos/temp/${req.body.tempFile}`, originalname: req.body.tempFile },
            product._id.toString()
          );
          
          product.hasImage = true;
          await product.save();
        } catch (imageError) {
          console.error('Error moviendo imagen:', imageError);
        }
      }
      
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error creating product', error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const updateData = { ...req.body };
      
      // Si hay una nueva imagen temporal, procesarla
      if (req.body.tempFile) {
        try {
          await filesystemService.moveImageToProducto(
            { path: `/app/productos/temp/${req.body.tempFile}`, originalname: req.body.tempFile },
            req.params.id
          );
          updateData.hasImage = true;
        } catch (imageError) {
          console.error('Error actualizando imagen:', imageError);
        }
      }
      
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error updating product', error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Eliminar el producto
      await Product.findByIdAndDelete(req.params.id);
      
      // Eliminar la imagen asociada
      if (product.hasImage) {
        try {
          await filesystemService.deleteProductoImage(product._id.toString());
        } catch (imageError) {
          console.error('Error eliminando imagen:', imageError);
        }
      }
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = productController;