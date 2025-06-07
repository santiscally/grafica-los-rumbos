const Order = require('../models/order.model');
const Product = require('../models/product.model');
const notificationService = require('../services/notification.service');
const mongoose = require('mongoose');

const orderController = {
  async createOrder(req, res) {
    try {
      const { customerEmail, customerPhone, customerName, products, customOrder, serviceType, specifications, files } = req.body;
      
      let totalPrice = 0;
      let processedProducts = [];
      
      if (customOrder) {
        processedProducts = products.map(item => ({
          productId: item.productId || 'custom',
          name: item.name,
          quantity: item.quantity
        }));
        totalPrice = 0;
      } else {
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
      
      // Sin console.log
      notificationService.sendOrderConfirmation(order);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Error creating order', error: error.message });
    }
  },

  async createCustomOrder(req, res) {
    try {
      const orderData = JSON.parse(req.body.orderData);
      const uploadedFiles = req.files || [];
      
      const filesInfo = uploadedFiles.map(file => ({
        filename: file.originalname,
        fileId: file.id,
        uploadedAt: new Date()
      }));
      
      const order = new Order({
        ...orderData,
        files: filesInfo,
        totalPrice: 0
      });
      
      await order.save();
      notificationService.sendOrderConfirmation(order);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Error creating custom order', error: error.message });
    }
  },

  async getOrders(req, res) {
    try {
      const { status, year, startDate, endDate, page = 1, limit = 10, customOrder } = req.query;
      
      const query = {};
      if (status) query.status = status;
      if (customOrder !== undefined) query.customOrder = customOrder === 'true';
      
      let sort = { createdAt: -1 };
      
      if (year || startDate || endDate) {
        const productQuery = {};
        if (year) productQuery.year = year;
        if (startDate || endDate) {
          productQuery.date = {};
          if (startDate) productQuery.date.$gte = new Date(startDate);
          if (endDate) productQuery.date.$lte = new Date(endDate);
        }
        
        const relevantProducts = await Product.find(productQuery).select('_id');
        const productIds = relevantProducts.map(p => p._id);
        
        if (!query.customOrder) {
          query['products.productId'] = { $in: productIds };
        }
      }
      
      const orders = await Order.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const populatedOrders = [];
      for (let order of orders) {
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

  async getOrderStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ 
        status: { $in: ['creado', 'en proceso'] } 
      });
      const activeProducts = await Product.countDocuments();
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const monthlyOrders = await Order.find({
        createdAt: { $gte: startOfMonth },
        status: { $ne: 'anulado' }
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      res.json({
        totalOrders,
        pendingOrders,
        activeProducts,
        monthlyRevenue
      });
    } catch (error) {
      res.status(500).json({ message: 'Error getting stats', error: error.message });
    }
  },

  async getOrderFiles(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json({ files: order.files || [] });
    } catch (error) {
      res.status(500).json({ message: 'Error getting order files', error: error.message });
    }
  },

  async downloadOrderFile(req, res) {
    try {
      const { orderId, fileId } = req.params;
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const fileInfo = order.files.find(f => f.fileId.toString() === fileId);
      
      if (!fileInfo) {
        return res.status(404).json({ message: 'File not found in order' });
      }
      
      // Redirigir a la ruta de descarga de archivos
      res.redirect(`/api/files/${fileId}`);
    } catch (error) {
      res.status(500).json({ message: 'Error downloading file', error: error.message });
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
      
      const { type } = req.body;
      
      await notificationService.sendNotification(order, type);
      
      res.json({ message: 'Notification sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
  },

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

module.exports = orderController;