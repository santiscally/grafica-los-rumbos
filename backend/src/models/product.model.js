// backend/models/product.model.js - ACTUALIZADO CON CATEGORÍAS
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  year: {
    type: String,
    required: false, // Ya no es requerido, ahora usamos categorías
    enum: ['7mo grado', '1er año', '2do año', '3er año', '4to año', '5to año', '']
  },
  subject: {
    type: String,
    required: false // Ya no es requerido, ahora usamos categorías
  },
  code: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  featured: {
    type: Boolean,
    default: false // Para productos destacados
  },
  discount: {
    type: Number,
    default: 0, // Porcentaje de descuento
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para precio con descuento
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

productSchema.virtual('imageUrl').get(function() {
  return this.hasImage ? `/api/files/product/${this._id}` : null;
});

// Middleware para actualizar contador de productos en categorías
productSchema.post('save', async function(doc) {
  const Category = mongoose.model('Category');
  
  if (doc.category) {
    const cat = await Category.findById(doc.category);
    if (cat) await cat.updateProductCount();
  }
  
  if (doc.subcategory) {
    const subcat = await Category.findById(doc.subcategory);
    if (subcat) await subcat.updateProductCount();
  }
});

productSchema.post('remove', async function(doc) {
  const Category = mongoose.model('Category');
  
  if (doc.category) {
    const cat = await Category.findById(doc.category);
    if (cat) await cat.updateProductCount();
  }
  
  if (doc.subcategory) {
    const subcat = await Category.findById(doc.subcategory);
    if (subcat) await subcat.updateProductCount();
  }
});

module.exports = mongoose.model('Product', productSchema);