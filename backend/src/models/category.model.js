// backend/models/category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true,
    default: 'fas fa-folder' // Icono Font Awesome por defecto
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null significa que es categoría principal
  },
  level: {
    type: Number,
    default: 1, // 1 para categoría, 2 para subcategoría
    enum: [1, 2]
  },
  order: {
    type: Number,
    default: 0 // Para ordenar las categorías en la visualización
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false // Si true, no aparece en la landing pública
  },
  slug: {
    type: String,
    unique: true,
    sparse: true // Solo las categorías ocultas tienen slug
  },
  productCount: {
    type: Number,
    default: 0 // Contador de productos en esta categoría
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener subcategorías
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Método para actualizar el contador de productos
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    $or: [
      { category: this._id },
      { subcategory: this._id }
    ]
  });
  this.productCount = count;
  await this.save();
};

// Middleware para evitar eliminar categorías con productos
categorySchema.pre('deleteOne', { document: true }, async function(next) {
  const Product = mongoose.model('Product');
  const hasProducts = await Product.exists({ 
    $or: [
      { category: this._id },
      { subcategory: this._id }
    ]
  });
  
  if (hasProducts) {
    throw new Error('No se puede eliminar una categoría que tiene productos asociados');
  }
  
  // Verificar si tiene subcategorías
  const hasSubcategories = await this.model('Category').exists({ parentCategory: this._id });
  if (hasSubcategories) {
    throw new Error('No se puede eliminar una categoría que tiene subcategorías');
  }
  
  next();
});

module.exports = mongoose.model('Category', categorySchema);