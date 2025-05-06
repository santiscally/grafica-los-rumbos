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
      // Verificar que el body incluye un ID de imagen válido
      if (!req.body.image) {
        return res.status(400).json({ message: 'Se requiere un ID de imagen' });
      }
      
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error creating product', error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      // Asegurarse de que si no se incluye una nueva imagen, se mantenga la existente
      if (!req.body.image) {
        const existingProduct = await Product.findById(req.params.id);
        if (existingProduct) {
          req.body.image = existingProduct.image;
        }
      }
      
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
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
      // Obtener el producto antes de eliminarlo para tener acceso al ID de la imagen
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Eliminar el producto
      await Product.findByIdAndDelete(req.params.id);
      
      // Opcionalmente, puedes eliminar la imagen asociada
      // Para ello necesitarías acceso al servicio GridFS
      // Comenta esta sección si prefieres conservar las imágenes
      /*
      const gridFSBucket = require('../services/gridfs.service').getGridFSBucket();
      if (gridFSBucket && product.image) {
        try {
          await gridFSBucket.delete(new mongoose.Types.ObjectId(product.image));
          console.log(`Imagen ${product.image} eliminada.`);
        } catch (fileError) {
          console.error(`Error al eliminar imagen ${product.image}:`, fileError);
        }
      }
      */
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = productController;