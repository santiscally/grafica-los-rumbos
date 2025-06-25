// backend/models/product.model.js - REEMPLAZAR TODO
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
  year: {
    type: String,
    required: true,
    enum: ['7mo grado', '1er año', '2do año', '3er año', '4to año', '5to año']
  },
  subject: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

productSchema.virtual('imageUrl').get(function() {
  return this.hasImage ? `/api/files/product/${this._id}` : null;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);