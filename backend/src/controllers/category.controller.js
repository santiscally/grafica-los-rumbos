// backend/controllers/category.controller.js
const Category = require('../models/category.model');
const Product = require('../models/product.model');

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const categoryController = {
  // Obtener todas las categorias con sus subcategorias
  async getCategories(req, res) {
    try {
      const { includeSubcategories = true, onlyActive = false, includeHidden = false } = req.query;

      const query = onlyActive ? { isActive: true } : {};
      if (includeHidden !== 'true') {
        query.hidden = { $ne: true };
      }
      
      if (includeSubcategories === 'false') {
        query.parentCategory = null;
      }
      
      const categories = await Category.find(query)
        .populate('subcategories')
        .sort({ level: 1, order: 1, name: 1 });
      
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
      res.status(500).json({ message: 'Error al obtener categorias', error: error.message });
    }
  },

  // Obtener categoria por ID
  async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id)
        .populate('subcategories');
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener categoria', error: error.message });
    }
  },

  // Obtener categoria por slug (para páginas ocultas)
  async getCategoryBySlug(req, res) {
    try {
      const category = await Category.findOne({ slug: req.params.slug, hidden: true })
        .populate('subcategories');

      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener categoria', error: error.message });
    }
  },

  // Crear nueva categoria
  async createCategory(req, res) {
    try {
      const { name, description, icon, parentCategory, order, hidden } = req.body;

      let level = 1;
      let parentDoc = null;
      if (parentCategory) {
        parentDoc = await Category.findById(parentCategory);
        if (!parentDoc) {
          return res.status(400).json({ message: 'Categoria padre no encontrada' });
        }
        if (parentDoc.level !== 1) {
          return res.status(400).json({ message: 'Solo se permiten dos niveles de categorias' });
        }
        level = 2;
      }

      let isHidden = hidden === true || hidden === 'true';

      // Si el padre es oculto, la subcategoría debe ser oculta obligatoriamente
      if (parentDoc && parentDoc.hidden) {
        isHidden = true;
      }

      const category = new Category({
        name,
        description,
        icon: icon || 'fas fa-folder',
        parentCategory: parentCategory || null,
        level,
        order: order || 0,
        hidden: isHidden,
        slug: isHidden ? generateSlug(name) : undefined
      });
      
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ya existe una categoria con ese nombre' });
      }
      res.status(400).json({ message: 'Error al crear categoria', error: error.message });
    }
  },

  // Actualizar categoria
  async updateCategory(req, res) {
    try {
      const { name, description, icon, parentCategory, order, isActive, hidden } = req.body;
      
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }
      
      let parentDoc = null;
      if (parentCategory !== undefined && parentCategory !== category.parentCategory) {
        if (parentCategory) {
          parentDoc = await Category.findById(parentCategory);
          if (!parentDoc) {
            return res.status(400).json({ message: 'Categoria padre no encontrada' });
          }
          if (parentDoc.level !== 1) {
            return res.status(400).json({ message: 'Solo se permiten dos niveles de categorias' });
          }
          category.level = 2;
        } else {
          category.level = 1;
        }
        category.parentCategory = parentCategory;
      } else if (category.parentCategory) {
        parentDoc = await Category.findById(category.parentCategory);
      }

      if (name !== undefined) category.name = name;
      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      if (order !== undefined) category.order = order;
      if (isActive !== undefined) category.isActive = isActive;

      // Si el padre es oculto, forzar oculta
      if (parentDoc && parentDoc.hidden) {
        category.hidden = true;
        if (!category.slug) {
          category.slug = generateSlug(name || category.name);
        }
      } else if (hidden !== undefined) {
        const isHidden = hidden === true || hidden === 'true';
        category.hidden = isHidden;
        if (isHidden && !category.slug) {
          category.slug = generateSlug(name || category.name);
        }
        if (!isHidden) {
          category.slug = undefined;
        }
      }
      
      await category.save();
      res.json(category);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Ya existe una categoria con ese nombre' });
      }
      res.status(400).json({ message: 'Error al actualizar categoria', error: error.message });
    }
  },

  // Eliminar categoria
  async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }
      
      const hasProducts = await Product.exists({ 
        $or: [
          { category: category._id },
          { subcategory: category._id }
        ]
      });
      
      if (hasProducts) {
        return res.status(400).json({ 
          message: 'No se puede eliminar una categoria que tiene productos asociados' 
        });
      }
      
      const hasSubcategories = await Category.exists({ parentCategory: category._id });
      if (hasSubcategories) {
        return res.status(400).json({ 
          message: 'No se puede eliminar una categoria que tiene subcategorias' 
        });
      }
      
      await category.deleteOne();
      res.json({ message: 'Categoria eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar categoria', error: error.message });
    }
  },

  // Obtener productos de una categoria CON FILTRO DE PRECIO
  async getCategoryProducts(req, res) {
    try {
      const categoryId = req.params.id;
      const { page = 1, limit = 12, sort = 'name', minPrice, maxPrice, search, year, subject } = req.query;
      
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Categoria no encontrada' });
      }
      
      const query = category.level === 1 
        ? { category: categoryId }
        : { subcategory: categoryId };
      
      // FILTROS DE AÑO Y MATERIA
      if (year) query.year = year;
      if (subject) query.subject = { $regex: subject, $options: 'i' };

      // FILTRO DE BÚSQUEDA
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }

      // FILTRO DE PRECIO
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
          query.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          query.price.$lte = parseFloat(maxPrice);
        }
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
        totalPages: Math.ceil(total / limit),
        category
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
  },

  // Obtener lista de iconos disponibles
  getAvailableIcons(req, res) {
    const icons = [
      { value: 'fas fa-graduation-cap', label: 'Graduacion', category: 'education' },
      { value: 'fas fa-book', label: 'Libro', category: 'education' },
      { value: 'fas fa-book-open', label: 'Libro Abierto', category: 'education' },
      { value: 'fas fa-pencil-alt', label: 'Lapiz', category: 'education' },
      { value: 'fas fa-pen', label: 'Lapicera', category: 'education' },
      { value: 'fas fa-ruler', label: 'Regla', category: 'education' },
      { value: 'fas fa-calculator', label: 'Calculadora', category: 'education' },
      { value: 'fas fa-chalkboard', label: 'Pizarra', category: 'education' },
      { value: 'fas fa-school', label: 'Escuela', category: 'education' },
      { value: 'fas fa-university', label: 'Universidad', category: 'education' },
      { value: 'fas fa-backpack', label: 'Mochila', category: 'education' },
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
      { value: 'fas fa-palette', label: 'Paleta de Colores', category: 'art' },
      { value: 'fas fa-paint-brush', label: 'Pincel', category: 'art' },
      { value: 'fas fa-pencil-ruler', label: 'Lapiz y Regla', category: 'art' },
      { value: 'fas fa-drafting-compass', label: 'Compas', category: 'art' },
      { value: 'fas fa-laptop', label: 'Laptop', category: 'tech' },
      { value: 'fas fa-desktop', label: 'Computadora', category: 'tech' },
      { value: 'fas fa-print', label: 'Impresora', category: 'tech' },
      { value: 'fas fa-copy', label: 'Copiar', category: 'tech' },
      { value: 'fas fa-star', label: 'Estrella', category: 'general' },
      { value: 'fas fa-tag', label: 'Etiqueta', category: 'general' },
      { value: 'fas fa-shopping-bag', label: 'Bolsa', category: 'general' },
      { value: 'fas fa-box', label: 'Caja', category: 'general' }
    ];
    
    res.json(icons);
  }
};

module.exports = categoryController;