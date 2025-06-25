// backend/src/services/notification.service.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Variable para almacenar el servicio de email activo
let emailService = null;
let transporter = null;

// Inicializar servicio de email
const initializeEmailService = () => {
  // Primero intentar con SendGrid
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    emailService = 'sendgrid';
    console.log('Servicio de email configurado con SendGrid');
  } 
  // Si no hay SendGrid, intentar con Gmail
  else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    emailService = 'gmail';
    console.log('Servicio de email configurado con Gmail');
  } else {
    console.log('No hay servicio de email configurado - las notificaciones serán simuladas');
  }
};

// Inicializar al cargar el módulo
initializeEmailService();

// Función para enviar email
const sendEmail = async (to, subject, html) => {
  if (emailService === 'sendgrid') {
    const msg = {
      to,
      from: {
        email: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@graficalosrumbos.com',
        name: process.env.EMAIL_FROM_NAME || 'Gráfica Los Rumbos'
      },
      subject,
      html
    };
    
    try {
      await sgMail.send(msg);
      console.log('Email enviado con SendGrid');
      return true;
    } catch (error) {
      console.error('Error enviando email con SendGrid:', error);
      if (error.response) {
        console.error('SendGrid error response:', error.response.body);
      }
      throw error;
    }
  } else if (emailService === 'gmail' && transporter) {
    const info = await transporter.sendMail({
      from: `"Gráfica Los Rumbos" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email enviado con Gmail:', info.messageId);
    return true;
  } else {
    console.log('Email simulado - no hay servicio configurado');
    return false;
  }
};

// Plantilla de email para confirmación de pedido
const orderConfirmationTemplate = (order) => {
  const isCustomOrder = order.customOrder;
  const orderDetails = isCustomOrder 
    ? `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${order.serviceType || 'Pedido Personalizado'}</strong><br>
          ${order.specifications?.cantidadPaginas ? `Páginas: ${order.specifications.cantidadPaginas}<br>` : ''}
          ${order.specifications?.cantidad ? `Copias: ${order.specifications.cantidad}<br>` : ''}
          ${order.specifications?.observaciones ? `<small>${order.specifications.observaciones}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${order.totalPrice > 0 ? `$${order.totalPrice.toFixed(2)}` : 'A confirmar'}
        </td>
      </tr>
    `
    : order.products.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name || 'Producto'} (x${item.quantity})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${((item.price || 0) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido - Gráfica Los Rumbos</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #0d6efd; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Gráfica Los Rumbos</h1>
            <p style="margin: 5px 0 0;">Confirmación de Pedido</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Pedido Recibido!</h2>
            
            <p style="color: #666; margin-bottom: 20px;">
                Hola ${order.customerName || 'Cliente'},<br><br>
                Hemos recibido tu pedido <strong>#${order.orderCode || order._id}</strong> correctamente.
                ${isCustomOrder && order.totalPrice === 0 ? '<br><strong>Nota:</strong> El precio final será confirmado después de revisar los archivos.' : ''}
            </p>
            
            <div style="background-color: #f8f9fa; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #333;">Detalles del pedido:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    ${orderDetails}
                    ${order.totalPrice > 0 ? `
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Total:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #0d6efd;">
                            $${order.totalPrice.toFixed(2)}
                        </td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            <div style="background-color: #e3f2fd; border-left: 4px solid #0d6efd; padding: 15px; margin-bottom: 20px;">
                <strong>Estado actual:</strong> ${order.status === 'creado' ? 'Pendiente de proceso' : order.status}
            </div>
            
            <p style="color: #666;">
                Te notificaremos cuando tu pedido esté listo para retirar.<br>
                Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 14px;">
                <p>
                    <strong>Gráfica Los Rumbos</strong><br>
                    Tel: +54 11 4567-8901<br>
                    info@graficalosrumbos.com
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Plantilla de email para pedido listo
const orderReadyTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Listo - Gráfica Los Rumbos</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #28a745; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">¡Tu pedido está listo!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #666; margin-bottom: 20px; font-size: 16px;">
                Hola ${order.customerName || 'Cliente'},
            </p>
            
            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px;">
                <strong style="font-size: 18px;">Tu pedido #${order.orderCode || order._id} está listo para retirar</strong>
            </div>
            
            <div style="background-color: #f8f9fa; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #333;">Información de retiro:</h3>
                <p style="margin: 10px 0;"><strong>Horario:</strong> Lunes a Viernes: 8:00 - 20:00 | Sábados: 9:00 - 13:00</p>
                <p style="margin: 10px 0;"><strong>Dirección:</strong> [Tu dirección aquí]</p>
                ${order.totalPrice > 0 ? `<p style="margin: 10px 0;"><strong>Total a pagar:</strong> <span style="font-size: 20px; color: #28a745;">$${order.totalPrice.toFixed(2)}</span></p>` : ''}
            </div>
            
            <p style="color: #666;">
                Por favor, presenta este email o menciona tu número de pedido al momento de retirar.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 14px;">
                <p>
                    <strong>Gráfica Los Rumbos</strong><br>
                    Tel: +54 11 4567-8901<br>
                    info@graficalosrumbos.com
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para formatear número de teléfono
const formatPhoneNumber = (phone) => {
  // Eliminar espacios, guiones y caracteres especiales
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Eliminar el + inicial si existe
  cleaned = cleaned.replace(/^\+/, '');
  
  // Si es un número argentino sin código de país (empieza con 11 y tiene 10 dígitos)
  if (cleaned.startsWith('11') && cleaned.length === 10) {
    cleaned = '549' + cleaned; // Agregar 549 para Argentina móvil
  }
  // Si es un número sin código de país
  else if (!cleaned.startsWith('54') && cleaned.length <= 10) {
    cleaned = '549' + cleaned; // Agregar 549 para Argentina móvil
  }
  // Si tiene 54 pero no 549 y es un celular
  else if (cleaned.startsWith('54') && !cleaned.startsWith('549') && cleaned.length === 12) {
    cleaned = '549' + cleaned.substring(2); // Cambiar 54 por 549
  }
  
  return cleaned;
};

// Función para generar mensaje de WhatsApp
const generateWhatsAppMessage = (order, type) => {
  const orderNumber = order.orderCode || order._id;
  const customerName = order.customerName || 'Cliente';
  
  if (type === 'confirmation') {
    const isCustomOrder = order.customOrder;
    let message = `Hola ${customerName}! 🙌\n\n`;
    message += `Recibimos tu pedido #${orderNumber} correctamente.\n\n`;
    
    if (isCustomOrder) {
      message += `📋 *Detalles:*\n`;
      message += `• Servicio: ${order.serviceType || 'Pedido Personalizado'}\n`;
      if (order.specifications?.cantidadPaginas) {
        message += `• Páginas: ${order.specifications.cantidadPaginas}\n`;
      }
      if (order.specifications?.cantidad) {
        message += `• Copias: ${order.specifications.cantidad}\n`;
      }
      if (order.totalPrice > 0) {
        message += `• Total: $${order.totalPrice.toFixed(2)}\n`;
      } else {
        message += `• Precio: A confirmar\n`;
      }
    } else {
      message += `📋 *Productos:*\n`;
      order.products.forEach(item => {
        message += `• ${item.name || 'Producto'} (x${item.quantity})\n`;
      });
      message += `\n💰 *Total: $${order.totalPrice.toFixed(2)}*\n`;
    }
    
    message += `\n✅ Estado: Pendiente de proceso\n`;
    message += `\nTe avisaremos cuando esté listo para retirar.\n`;
    message += `\n_Gráfica Los Rumbos_`;
    
    return message;
  }
  
  if (type === 'ready') {
    let message = `Hola ${customerName}! 🎉\n\n`;
    message += `Tu pedido #${orderNumber} está *LISTO PARA RETIRAR* ✅\n\n`;
    
    if (order.totalPrice > 0) {
      message += `💰 Total a pagar: *$${order.totalPrice.toFixed(2)}*\n\n`;
    }
    
    message += `📍 *Horarios de retiro:*\n`;
    message += `• Lunes a Viernes: 8:00 - 20:00\n`;
    message += `• Sábados: 9:00 - 13:00\n\n`;
    message += `Por favor, menciona tu número de pedido al retirar.\n\n`;
    message += `_Gráfica Los Rumbos_\n`;
    message += `_Tel: +54 11 4567-8901_`;
    
    return message;
  }
};

const notificationService = {
  async sendOrderConfirmation(order) {
    console.log('Enviando confirmación de pedido...');
    
    // Enviar email si está configurado
    if (emailService) {
      try {
        await sendEmail(
          order.customerEmail,
          `Confirmación de Pedido #${order.orderCode || order._id} - Gráfica Los Rumbos`,
          orderConfirmationTemplate(order)
        );
      } catch (error) {
        console.error('Error enviando email de confirmación:', error);
      }
    } else {
      console.log('Email simulado - Configurar SENDGRID_API_KEY o EMAIL_USER/EMAIL_PASS para envío real');
    }
    
    // Log del mensaje de WhatsApp (se enviará manualmente desde el frontend)
    console.log('Mensaje WhatsApp de confirmación generado');
  },

  async sendOrderReady(order) {
    console.log('Enviando notificación de pedido listo...');
    
    // Enviar email si está configurado
    if (emailService) {
      try {
        await sendEmail(
          order.customerEmail,
          `¡Tu pedido está listo! #${order.orderCode || order._id} - Gráfica Los Rumbos`,
          orderReadyTemplate(order)
        );
      } catch (error) {
        console.error('Error enviando email de pedido listo:', error);
      }
    } else {
      console.log('Email simulado - Configurar SENDGRID_API_KEY o EMAIL_USER/EMAIL_PASS para envío real');
    }
  },

  async sendNotification(order, type) {
    console.log(`Enviando notificación ${type}...`);
    
    if (type === 'email' && order.status === 'listo') {
      await this.sendOrderReady(order);
      return { success: true, message: 'Email enviado' };
    }
    
    if (type === 'whatsapp') {
      // Generar mensaje según el estado
      const messageType = order.status === 'listo' ? 'ready' : 'confirmation';
      const message = generateWhatsAppMessage(order, messageType);
      
      // Formatear número de teléfono
      const formattedPhone = formatPhoneNumber(order.customerPhone);
      
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      
      return { 
        success: true, 
        whatsappUrl,
        message: 'URL de WhatsApp generada'
      };
    }
    
    throw new Error('Tipo de notificación inválido o estado incorrecto');
  },

  // Método para obtener URL de WhatsApp directamente
  generateWhatsAppUrl(order, type) {
    const message = generateWhatsAppMessage(order, type);
    const formattedPhone = formatPhoneNumber(order.customerPhone);
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }
};

module.exports = notificationService;