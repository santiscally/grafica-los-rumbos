// backend/controllers/category.controller.js
const Category = require('../models/category.model');
const Product = require('../models/product.model');

const categoryController = {
  // Obtener todas las categorías con sus subcategorías
  async getCategories(req, res) {
    try {
      const { includeSubcategories = true, onlyActive = false } = req.query;
      
      const query = onlyActive ? { isActive: true } : {};
      
      if (includeSubcategories === 'false') {
        query.parentCategory = null; // Solo categorías principales
      }
      
      const categories = await Category.find(query)
        .populate('subcategories')
        .sort({ level: 1, order: 1, name: 1 });
      
      // Organizar categorías con sus subcategorías
      const organizedCategories = categories
        .filter(cat => cat.level === 1)
        .map(cat => ({
          ...cat.toObject(),
          subcategories: categories.filter(subcat => 
            subcat.parentCategory && 
            subcat.parentCategory.toString() === cat._id.toString()
          )
        }));
      
      res.json(organizedCategories);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
  },

  // Obtener categoría por ID
  async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id)
        .populate('subcategories');
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
    }
  },

  // Crear nueva categoría
  async createCategory(req, res) {
    try {
      const { name, description, icon, parentCategory, order } = req.body;
      
      // Validar si es subcategoría
      let level = 1;
      if (parentCategory) {
        const parent = await Category.findById(parentCategory);
        if (!parent) {
          return res.status(400).json({ message: 'Categoría padre no encontrada' });
        }
        if (parent.level !== 1) {
          return res.status(400).json({ message: 'Solo se permiten dos niveles de categorías' });
        }
        level = 2;
      }
      
      const category = new Category({
        name,
        description,
        icon: icon || 'fas fa-folder',
        parentCategory: parentCategory || null,
        level,
        order: order || 0
      });
      
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      }
      res.status(400).json({ message: 'Error al crear categoría', error: error.message });
    }
  },

  // Actualizar categoría
  async updateCategory(req, res) {
    try {
      const { name, description, icon, parentCategory, order, isActive } = req.body;
      
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Si se está cambiando el parentCategory, validar
      if (parentCategory !== undefined && parentCategory !== category.parentCategory) {
        if (parentCategory) {
          const parent = await Category.findById(parentCategory);
          if (!parent) {
            return res.status(400).json({ message: 'Categoría padre no encontrada' });
          }
          if (parent.level !== 1) {
            return res.status(400).json({ message: 'Solo se permiten dos niveles de categorías' });
          }
          category.level = 2;
        } else {
          category.level = 1;
        }
        category.parentCategory = parentCategory;
      }
      
      if (name !== undefined) category.name = name;
      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;
      
      await category.save();
      res.json(category);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
      }
      res.status(400).json({ message: 'Error al actualizar categoría', error: error.message });
    }
  },

  // Eliminar categoría
  async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Verificar si tiene productos
      const hasProducts = await Product.exists({ 
        $or: [
          { category: category._id },
          { subcategory: category._id }
        ]
      });
      
      if (hasProducts) {
        return res.status(400).json({ 
          message: 'No se puede eliminar una categoría que tiene productos asociados' 
        });
      }
      
      // Verificar si tiene subcategorías
      const hasSubcategories = await Category.exists({ parentCategory: category._id });
      if (hasSubcategories) {
        return res.status(400).json({ 
          message: 'No se puede eliminar una categoría que tiene subcategorías' 
        });
      }
      
      await category.deleteOne();
      res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
    }
  },

  // Obtener productos de una categoría
  async getCategoryProducts(req, res) {
    try {
      const categoryId = req.params.id;
      const { page = 1, limit = 12, sort = 'name' } = req.query;
      
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      // Buscar productos en esta categoría o subcategoría
      const query = category.level === 1 
        ? { category: categoryId }
        : { subcategory: categoryId };
      
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
        totalPages: Math.ceil(total / limit),
        category
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
  },

  // Obtener lista de iconos disponibles (Font Awesome)
  getAvailableIcons(req, res) {
    const icons = [
      // Educación y escuela
      { value: 'fas fa-graduation-cap', label: 'Graduación', category: 'education' },
      { value: 'fas fa-book', label: 'Libro', category: 'education' },
      { value: 'fas fa-book-open', label: 'Libro Abierto', category: 'education' },
      { value: 'fas fa-pencil-alt', label: 'Lápiz', category: 'education' },
      { value: 'fas fa-pen', label: 'Lapicera', category: 'education' },
      { value: 'fas fa-ruler', label: 'Regla', category: 'education' },
      { value: 'fas fa-calculator', label: 'Calculadora', category: 'education' },
      { value: 'fas fa-chalkboard', label: 'Pizarra', category: 'education' },
      { value: 'fas fa-school', label: 'Escuela', category: 'education' },
      { value: 'fas fa-university', label: 'Universidad', category: 'education' },
      { value: 'fas fa-backpack', label: 'Mochila', category: 'education' },
      
      // Oficina y papelería
      { value: 'fas fa-paperclip', label: 'Clip', category: 'office' },
      { value: 'fas fa-stapler', label: 'Abrochadora', category: 'office' },
      { value: 'fas fa-scissors', label: 'Tijeras', category: 'office' },
      { value: 'fas fa-eraser', label: 'Goma de Borrar', category: 'office' },
      { value: 'fas fa-highlighter', label: 'Resaltador', category: 'office' },
      { value: 'fas fa-marker', label: 'Marcador', category: 'office' },
      { value: 'fas fa-clipboard', label: 'Portapapeles', category: 'office' },
      { value: 'fas fa-folder', label: 'Carpeta', category: 'office' },
      { value: 'fas fa-folder-open', label: 'Carpeta Abierta', category: 'office' },
      { value: 'fas fa-file-alt', label: 'Documento', category: 'office' },
      { value: 'fas fa-sticky-note', label: 'Nota Adhesiva', category: 'office' },
      
      // Arte y creatividad
      { value: 'fas fa-palette', label: 'Paleta de Colores', category: 'art' },
      { value: 'fas fa-paint-brush', label: 'Pincel', category: 'art' },
      { value: 'fas fa-pencil-ruler', label: 'Lápiz y Regla', category: 'art' },
      { value: 'fas fa-drafting-compass', label: 'Compás', category: 'art' },
      
      // Tecnología
      { value: 'fas fa-laptop', label: 'Laptop', category: 'tech' },
      { value: 'fas fa-desktop', label: 'Computadora', category: 'tech' },
      { value: 'fas fa-print', label: 'Impresora', category: 'tech' },
      { value: 'fas fa-copy', label: 'Copiar', category: 'tech' },
      
      // General
      { value: 'fas fa-star', label: 'Estrella', category: 'general' },
      { value: 'fas fa-tag', label: 'Etiqueta', category: 'general' },
      { value: 'fas fa-shopping-bag', label: 'Bolsa', category: 'general' },
      { value: 'fas fa-box', label: 'Caja', category: 'general' }
    ];
    
    res.json(icons);
  }
};

module.exports = categoryController;