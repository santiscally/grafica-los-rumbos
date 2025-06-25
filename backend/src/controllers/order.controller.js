// backend/controllers/order.controller.js - ARCHIVO COMPLETO CORREGIDO
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Counter = require('../models/counter.model');
const notificationService = require('../services/notification.service');
const filesystemService = require('../services/filesystem.service');
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
          quantity: parseInt(item.quantity) || 1
        }));
        totalPrice = specifications?.totalPrice || req.body.totalPrice || 0;
      } else {
        for (const item of products) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(404).json({ message: `Product ${item.productId} not found` });
          }
          totalPrice += product.price * item.quantity;
          processedProducts.push({
            productId: item.productId,
            quantity: parseInt(item.quantity) || 1
          });
        }
      }
      
      const order = new Order({
        customerEmail,
        customerPhone,
        customerName,
        customOrder: customOrder || false,
        serviceType: serviceType || '',
        specifications: specifications || {},
        files: files || [],
        products: processedProducts,
        totalPrice
      });
      
      await order.save();
      
      notificationService.sendOrderConfirmation(order);
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(400).json({ message: 'Error creating order', error: error.message });
    }
  },

  async createCustomOrder(req, res) {
    try {
      const orderData = JSON.parse(req.body.orderData);
      const uploadedFiles = req.files || [];
      
      const order = new Order({
        ...orderData,
        files: []
      });
      
      await order.save();
      
      if (uploadedFiles.length > 0) {
        const movedFiles = await filesystemService.moveFilesToPedido(uploadedFiles, order._id.toString());
        
        order.files = movedFiles.map(file => ({
          filename: file.filename,
          storedFilename: file.storedFilename
        }));
        
        await order.save();
      }
      
      notificationService.sendOrderConfirmation(order);
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating custom order:', error);
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
      const { orderId, filename } = req.params;
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const fileInfo = order.files.find(f => f.storedFilename === filename);
      
      if (!fileInfo) {
        return res.status(404).json({ message: 'File not found in order' });
      }
      
      res.redirect(`/api/files/order/${orderId}/${filename}`);
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
  },

async downloadOrderInfo(req, res) {
  try {
    const order = await Order.findById(req.params.id).lean();
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Para pedidos del catálogo, obtener información completa de productos
    let productsWithDetails = [];
    if (!order.customOrder && order.products) {
      for (let item of order.products) {
        try {
          const product = await Product.findById(item.productId).lean();
          productsWithDetails.push({
            ...item,
            product: product || {}
          });
        } catch (err) {
          console.error('Error fetching product:', err);
          productsWithDetails.push({
            ...item,
            product: {}
          });
        }
      }
    }
    
    // Generar HTML estilo recibo/ticket
    const fecha = new Date(order.createdAt);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    
    // Para pedidos personalizados, calcular precio total o mostrar "A confirmar"
    const customOrderPrice = order.customOrder ? 
      (order.totalPrice > 0 ? `$${order.totalPrice.toFixed(2)}` : 'A confirmar') : 
      '';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${order.orderCode || 'S/N'}</title>
        <style>
          @media print {
            @page {
              size: 80mm 200mm;
              margin: 0;
            }
            body {
              margin: 0;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            line-height: 1.3;
          }
          
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
          }
          
          .logo {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
            letter-spacing: -0.5px;
          }
          
          .divider {
            text-align: center;
            margin: 10px 0;
            overflow: hidden;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            display: inline-block;
            width: 100%;
            height: 1px;
            background: repeating-linear-gradient(
              to right,
              #000,
              #000 3px,
              transparent 3px,
              transparent 6px
            );
            vertical-align: middle;
          }
          
          .order-number {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          
          .grades {
            display: flex;
            justify-content: center;
            gap: 5px;
            margin: 10px 0;
          }
          
          .grade-box {
            border: 1px solid #000;
            padding: 2px 6px;
            font-weight: bold;
            font-size: 11px;
          }
          
          .grade-box.selected {
            background: #000;
            color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .field {
            margin: 6px 0;
            font-size: 11px;
          }
          
          .field-label {
            display: inline-block;
            width: 60px;
          }
          
          .field-value {
            display: inline-block;
            border-bottom: 1px dotted #000;
            min-width: 180px;
            padding-bottom: 1px;
          }
          
          .products {
            margin: 10px 0;
            font-size: 11px;
          }
          
          .products-header {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .product-line {
            display: flex;
            margin: 3px 0;
            align-items: baseline;
          }
          
          .product-code {
            width: 35px;
            font-size: 10px;
          }
          
          .product-name {
            flex: 1;
            font-size: 10px;
            padding: 0 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .product-qty {
            font-size: 10px;
            margin-right: 5px;
          }
          
          .product-price {
            font-weight: bold;
            text-align: right;
            min-width: 40px;
          }
          
          .status-box {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            font-weight: bold;
            margin: 10px 0;
            font-size: 11px;
          }
          
          .total {
            font-size: 14px;
            font-weight: bold;
            text-align: right;
            margin: 10px 0;
            padding-top: 5px;
            border-top: 1px solid #000;
          }
          
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 10px;
          }
          
          .date-section {
            margin: 10px 0;
            font-size: 10px;
          }
          
          .payment-fields {
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">GRÁFICA LOS RUMBOS</div>
          <div style="font-size: 10px;">Tel: 4833-4057 / 4832-4854</div>
          <div style="font-size: 10px;">WhatsApp: +54 11 6486-8948</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="order-number">N° ${order.orderCode || 'S/N'}</div>
        
        ${!order.customOrder ? `
        <div class="grades">
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '7mo grado') ? 'selected' : ''}">7°</span>
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '1er año') ? 'selected' : ''}">1°</span>
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '2do año') ? 'selected' : ''}">2°</span>
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '3er año') ? 'selected' : ''}">3°</span>
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '4to año') ? 'selected' : ''}">4°</span>
          <span class="grade-box ${productsWithDetails.some(p => p.product?.year === '5to año') ? 'selected' : ''}">5°</span>
        </div>
        ` : ''}
        
        <div class="field">
          <span class="field-label">NOMBRE:</span>
          <span class="field-value">${order.customerName || 'No especificado'}</span>
        </div>

        <div class="field">
          <span class="field-label">EMAIL:</span>
          <span class="field-value">${order.customerEmail || ''}</span>
        </div>
        
        <div class="field">
          <span class="field-label">TELÉFONO:</span>
          <span class="field-value">${order.customerPhone || ''}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="products">
          <div class="products-header">DETALLE DEL PEDIDO:</div>
          ${order.customOrder ? `
            <div class="product-line">
              <span class="product-code"></span>
              <span class="product-name">${order.serviceType || 'Pedido Personalizado'}</span>
              <span class="product-qty"></span>
              <span class="product-price">${customOrderPrice}</span>
            </div>
            ${order.specifications?.cantidadPaginas ? `
              <div style="margin-left: 40px; font-size: 9px;">
                Páginas: ${order.specifications.cantidadPaginas}
              </div>
            ` : ''}
            ${order.specifications?.cantidad ? `
              <div style="margin-left: 40px; font-size: 9px;">
                Copias: ${order.specifications.cantidad}
              </div>
            ` : ''}
            ${order.specifications?.observaciones ? `
              <div style="margin-left: 40px; font-size: 9px;">
                Obs: ${order.specifications.observaciones}
              </div>
            ` : ''}
            ${order.files && order.files.length > 0 ? `
              <div style="margin-left: 40px; font-size: 9px;">
                Archivos: ${order.files.length} adjunto(s)
              </div>
            ` : ''}
          ` : productsWithDetails.map(item => {
            const code = item.product?.code || '';
            const name = item.product?.name || 'Producto';
            const price = item.product?.price || 0;
            const qty = item.quantity || 1;
            const subtotal = price * qty;
            
            return `
              <div class="product-line">
                <span class="product-code">${code}</span>
                <span class="product-name">${name}</span>
                <span class="product-qty">x${qty}</span>
                <span class="product-price">$${subtotal.toFixed(2)}</span>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="divider"></div>
        
        <div class="status-box">
          ESTADO: ${order.status?.toUpperCase() || 'CREADO'}
        </div>
        
        <div class="total">
          TOTAL: ${order.totalPrice > 0 ? `$${order.totalPrice.toFixed(2)}` : (order.customOrder ? 'A CONFIRMAR' : '$0.00')}
        </div>
        
        <div class="date-section">
          <div>Pedido el: ${dia}/${mes}/${año}</div>
        </div>
        
        <div class="payment-fields">
          <div class="field">
            <span class="field-label">A/Cta.:</span>
            <span>$.....................</span>
          </div>
          
          <div class="field">
            <span class="field-label">Saldo:</span>
            <span>$.....................</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div>¡Gracias por su compra!</div>
          <div>Conserve este comprobante</div>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="pedido-${order.orderCode || 'sin-numero'}.html"`);
    res.send(html);
    
  } catch (error) {
    console.error('Error in downloadOrderInfo:', error);
    res.status(500).json({ message: 'Error downloading order info', error: error.message });
  }
},

  async sendNotification(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      const { type } = req.body;
      
      const result = await notificationService.sendNotification(order, type);
      
      // Si es WhatsApp, devolver la URL para que el frontend la abra
      if (type === 'whatsapp' && result.whatsappUrl) {
        console.log('Enviando URL de WhatsApp al frontend:', result.whatsappUrl);
        return res.json({ 
          message: result.message, 
          whatsappUrl: result.whatsappUrl 
        });
      }
      
      res.json({ message: result.message || 'Notification sent successfully' });
    } catch (error) {
      console.error('Error en sendNotification:', error);
      res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
  }
};

module.exports = orderController;