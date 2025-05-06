// Este servicio está simulado para desarrollo futuro
const notificationService = {
  sendOrderConfirmation(order) {
    console.log('Simulating order confirmation notification');
    console.log(`To: ${order.customerEmail} / ${order.customerPhone}`);
    console.log(`Order ID: ${order._id}`);
    console.log(`Total: $${order.totalPrice}`);
  },

  sendOrderReady(order) {
    console.log('Simulating order ready notification');
    console.log(`To: ${order.customerEmail} / ${order.customerPhone}`);
    console.log(`Order ID: ${order._id} is ready for pickup`);
  },

  async sendNotification(order, type) {
    console.log(`Simulating ${type} notification`);
    
    switch (type) {
      case 'email':
        // Aquí iría la lógica de envío de email
        console.log(`Email would be sent to: ${order.customerEmail}`);
        console.log(`Subject: Your order ${order._id} is ready`);
        console.log(`Body: Your photocopies are ready for pickup`);
        break;
        
      case 'whatsapp':
        // Aquí iría la lógica de envío de WhatsApp
        console.log(`WhatsApp would be sent to: ${order.customerPhone}`);
        console.log(`Message: Your order ${order._id} is ready for pickup`);
        break;
        
      default:
        throw new Error('Invalid notification type');
    }
  },

  // Métodos comentados para implementación futura
  /*
  async sendEmail(to, subject, body) {
    // Implementar con nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html: body
    });
  },

  async sendWhatsApp(to, message) {
    // Implementar con Twilio
    const client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${to}`
    });
  }
  */
};

module.exports = notificationService;
