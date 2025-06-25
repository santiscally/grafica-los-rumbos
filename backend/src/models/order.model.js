// backend/models/order.model.js - REEMPLAZAR TODO
const mongoose = require('mongoose');
const Counter = require('./counter.model');

const orderSchema = new mongoose.Schema({
  orderCode: {
    type: Number,
    unique: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: false
  },
  customOrder: {
    type: Boolean,
    default: false
  },
  serviceType: {
    type: String,
    default: ''  // Removemos el enum para permitir cualquier valor
  },
  specifications: {
    cantidad: Number,
    cantidadPaginas: Number,
    color: Boolean,
    dobleCaras: Boolean,
    papel: String,
    observaciones: String,
    servicio: String,
    precioUnitario: Number
  },
  files: [{
    filename: String,
    storedFilename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  products: [{
    productId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['creado', 'en proceso', 'listo', 'anulado'],
    default: 'creado'
  },
  totalPrice: {
    type: Number,
    required: false,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Auto-incrementar orderCode
orderSchema.pre('save', async function(next) {
  if (!this.orderCode) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderCode' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderCode = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);