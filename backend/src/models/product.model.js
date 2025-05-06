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
  image: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  year: {
    type: String,
    required: true,
    enum: ['1er año', '2do año']
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

productSchema.virtual('imageUrl').get(function() {
  return `/api/files/${this.image}`;
});

// Asegurar que el virtual se incluya en toJSON y toObject
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Product', productSchema);
