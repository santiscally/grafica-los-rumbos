// backend/controllers/product.controller.js - ACTUALIZADO
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const filesystemService = require('../services/filesystem.service');

const productController = {
  async getProducts(req, res) {
    try {
      const { 
        year, 
        subject, 
        code,
        category,
        subcategory,
        featured,
        search,
        minPrice,
        maxPrice,
        sort = '-createdAt',
        page = 1,
        limit = 12
      } = req.query;

      const query = {};
      
      // Filtros antiguos (compatibilidad)
      if (year) query.year = year;
      if (subject) query.subject = subject;
      if (code) query.code = { $regex: code, $options: 'i' };
      
      // Nuevos filtros de categorías
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      if (featured) query.featured = featured === 'true';
      
      // Búsqueda de texto
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Filtro de precio
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      
      const products = await Product.find(query)
        .populate('category subcategory')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const total = await Product.countDocuments(query);
      
      res.json({
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const { category, subcategory } = req.body;
      
      // Validar categoría
      if (!category) {
        return res.status(400).json({ message: 'La categoría es requerida' });
      }
      
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({ message: 'Categoría no válida' });
      }
      
      // Validar subcategoría si se proporciona
      if (subcategory) {
        const subcategoryDoc = await Category.findById(subcategory);
        if (!subcategoryDoc) {
          return res.status(400).json({ message: 'Subcategoría no válida' });
        }
        if (subcategoryDoc.parentCategory?.toString() !== category) {
          return res.status(400).json({ message: 'La subcategoría no pertenece a la categoría seleccionada' });
        }
      }
      
      const product = new Product({
        ...req.body,
        hasImage: false
      });
      
      await product.save();
      
      // Actualizar contadores de categorías
      await categoryDoc.updateProductCount();
      if (subcategory) {
        const subcategoryDoc = await Category.findById(subcategory);
        await subcategoryDoc.updateProductCount();
      }
      
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Error creating product', error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const { category, subcategory } = req.body;
      
      // Validar categoría si se actualiza
      if (category) {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
          return res.status(400).json({ message: 'Categoría no válida' });
        }
      }
      
      // Validar subcategoría si se proporciona
      if (subcategory) {
        const subcategoryDoc = await Category.findById(subcategory);
        if (!subcategoryDoc) {
          return res.status(400).json({ message: 'Subcategoría no válida' });
        }
        if (category && subcategoryDoc.parentCategory?.toString() !== category) {
          return res.status(400).json({ message: 'La subcategoría no pertenece a la categoría seleccionada' });
        }
      }
      
      const oldProduct = await Product.findById(req.params.id);
      if (!oldProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const updateData = { ...req.body };
      
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Actualizar contadores de categorías si cambiaron
      if (oldProduct.category?.toString() !== category) {
        if (oldProduct.category) {
          const oldCat = await Category.findById(oldProduct.category);
          if (oldCat) await oldCat.updateProductCount();
        }
        if (category) {
          const newCat = await Category.findById(category);
          if (newCat) await newCat.updateProductCount();
        }
      }
      
      if (oldProduct.subcategory?.toString() !== subcategory) {
        if (oldProduct.subcategory) {
          const oldSubcat = await Category.findById(oldProduct.subcategory);
          if (oldSubcat) await oldSubcat.updateProductCount();
        }
        if (subcategory) {
          const newSubcat = await Category.findById(subcategory);
          if (newSubcat) await newSubcat.updateProductCount();
        }
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
      
      // Guardar referencias a categorías antes de eliminar
      const categoryId = product.category;
      const subcategoryId = product.subcategory;
      
      // Eliminar el producto
      await Product.findByIdAndDelete(req.params.id);
      
      // Actualizar contadores de categorías
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (category) await category.updateProductCount();
      }
      
      if (subcategoryId) {
        const subcategory = await Category.findById(subcategoryId);
        if (subcategory) await subcategory.updateProductCount();
      }
      
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
  },

  // Obtener productos destacados
  async getFeaturedProducts(req, res) {
    try {
      const products = await Product.find({ featured: true })
        .populate('category subcategory')
        .limit(8)
        .sort('-createdAt');
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos destacados', error: error.message });
    }
  },

  // Obtener productos nuevos
  async getNewProducts(req, res) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const products = await Product.find({
        createdAt: { $gte: thirtyDaysAgo }
      })
        .populate('category subcategory')
        .limit(8)
        .sort('-createdAt');
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos nuevos', error: error.message });
    }
  }
};

module.exports = productController;