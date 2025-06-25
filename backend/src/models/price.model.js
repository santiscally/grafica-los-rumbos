// backend/models/price.model.js
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  servicio: {
    type: String,
    required: true,
    unique: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Price', priceSchema);