// backend/controllers/order.controller.js - REEMPLAZAR TODO

const Order = require('../models/order.model');
const Product = require('../models/product.model');
const notificationService = require('../services/notification.service');

const orderController = {
  async createOrder(req, res) {
    try {
      const { customerEmail, customerPhone, customerName, products, customOrder, serviceType, specifications, files } = req.body;
      
      let totalPrice = 0;
      let processedProducts = [];
      
      // Si es un pedido personalizado
      if (customOrder) {
        processedProducts = products.map(item => ({
          productId: item.productId || 'custom',
          name: item.name,
          quantity: item.quantity
        }));
        // Para pedidos personalizados, el precio se determina después
        totalPrice = 0;
      } else {
        // Para pedidos normales, calcular precio
        for (const item of products) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Product ${item.productId} not found` });
          }
          totalPrice += product.price * item.quantity;
          processedProducts.push({
            productId: item.productId,
            quantity: item.quantity
          });
        }
      }
      
      const order = new Order({
        customerEmail,
        customerPhone,
        customerName,
        customOrder,
        serviceType,
        specifications,
        files,
        products: processedProducts,
        totalPrice
      });
      
      await order.save();
      
      // Simular envío de notificación de confirmación
      console.log(`Order created: ${order._id}`);
      notificationService.sendOrderConfirmation(order);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Error creating order', error: error.message });
    }
  },

  async getOrders(req, res) {
    try {
      const { status, year, startDate, endDate, page = 1, limit = 10, customOrder } = req.query;
      
      const query = {};
      if (status) query.status = status;
      if (customOrder !== undefined) query.customOrder = customOrder === 'true';
      
      let sort = { createdAt: -1 }; // FIFO por defecto
      
      if (year || startDate || endDate) {
        // Buscar productos por año o fecha
        const productQuery = {};
        if (year) productQuery.year = year;
        if (startDate || endDate) {
          productQuery.date = {};
          if (startDate) productQuery.date.$gte = new Date(startDate);
          if (endDate) productQuery.date.$lte = new Date(endDate);
        }
        
        const relevantProducts = await Product.find(productQuery).select('_id');
        const productIds = relevantProducts.map(p => p._id);
        
        // Solo aplicar filtro de productos si no es un pedido personalizado
        if (!query.customOrder) {
          query['products.productId'] = { $in: productIds };
        }
      }
      
      const orders = await Order.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      // Popular productos manualmente
      const populatedOrders = [];
      for (let order of orders) {
        const orderObj = order.toObject();
        
        // Popular productos solo si no es personalizado
        if (!order.customOrder) {
          for (let item of orderObj.products) {
            if (mongoose.Types.ObjectId.isValid(item.productId)) {
              const product = await Product.findById(item.productId);
              if (product) {
                item.productId = product;
              }
            }
          }
        }
        
        populatedOrders.push(orderObj);
      }
      
      const total = await Order.countDocuments(query);
      
      res.json({
        orders: populatedOrders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      
      if (!['creado', 'en proceso', 'listo', 'anulado'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Popular productos si no es personalizado
      const orderObj = order.toObject();
      if (!order.customOrder) {
        for (let item of orderObj.products) {
          if (mongoose.Types.ObjectId.isValid(item.productId)) {
            const product = await Product.findById(item.productId);
            if (product) {
              item.productId = product;
            }
          }
        }
      }
      
      // Simular notificación si el pedido está listo
      if (status === 'listo') {
        notificationService.sendOrderReady(order);
      }
      
      res.json(orderObj);
    } catch (error) {
      res.status(400).json({ message: 'Error updating order', error: error.message });
    }
  },

  async cancelOrder(req, res) {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: 'anulado' },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async sendNotification(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const { type } = req.body; // 'email' o 'whatsapp'
      
      await notificationService.sendNotification(order, type);
      
      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
  },

  // Nuevo endpoint para actualizar el precio de un pedido personalizado
  async updateOrderPrice(req, res) {
    try {
      const { totalPrice } = req.body;
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { totalPrice },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: 'Error updating order price', error: error.message });
    }
  }
};

const mongoose = require('mongoose');

module.exports = orderController;