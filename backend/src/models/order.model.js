// backend/models/order.model.js - REEMPLAZAR TODO

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    enum: ['impresion', 'fotocopia', 'encuadernacion', 'plastificado', 'otro', ''],
    default: ''
  },
  specifications: {
    cantidad: Number,
    color: Boolean,
    dobleCaras: Boolean,
    papel: String,
    observaciones: String
  },
  files: [{
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  products: [{
    productId: {
      type: mongoose.Schema.Types.Mixed, // Permite ObjectId o String para 'custom'
      required: true
    },
    name: String, // Para pedidos personalizados
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
    required: false, // No requerido para pedidos personalizados
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Método para popular productos solo si no es personalizado
orderSchema.methods.populateProducts = async function() {
  const Product = mongoose.model('Product');
  
  for (let item of this.products) {
    if (item.productId !== 'custom' && mongoose.Types.ObjectId.isValid(item.productId)) {
      const product = await Product.findById(item.productId);
      if (product) {
        item.productId = product;
      }
    }
  }
  
  return this;
};

module.exports = mongoose.model('Order', orderSchema);