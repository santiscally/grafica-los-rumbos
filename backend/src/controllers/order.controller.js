const Order = require('../models/order.model');
const Product = require('../models/product.model');
const notificationService = require('../services/notification.service');

const orderController = {
  async createOrder(req, res) {
    try {
      const { customerEmail, customerPhone, products } = req.body;
      
      // Calcular precio total
      let totalPrice = 0;
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        totalPrice += product.price * item.quantity;
      }
      
      const order = new Order({
        customerEmail,
        customerPhone,
        products,
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
      const { status, year, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      const query = {};
      if (status) query.status = status;
      
      let sort = { createdAt: -1 }; // FIFO por defecto
      
      if (year || startDate || endDate) {
        // Buscar productos por año o fecha
        const productQuery = {};
        if (year) productQuery.year = year;
        if (startDate || endDate) {
          productQuery.date = {};
          if (startDate) productQuery.date.$gte = new Date(startDate);
          if (endDate) productQuery.date.$gte = new Date(endDate);
        }
        
        const relevantProducts = await Product.find(productQuery).select('_id');
        const productIds = relevantProducts.map(p => p._id);
        
        query['products.productId'] = { $in: productIds };
      }
      
      const orders = await Order.find(query)
        .populate('products.productId')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const total = await Order.countDocuments(query);
      
      res.json({
        orders,
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
      ).populate('products.productId');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Simular notificación si el pedido está listo
      if (status === 'listo') {
        notificationService.sendOrderReady(order);
      }
      
      res.json(order);
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
      const order = await Order.findById(req.params.id).populate('products.productId');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const { type } = req.body; // 'email' o 'whatsapp'
      
      await notificationService.sendNotification(order, type);
      
      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
  }
};

module.exports = orderController;
