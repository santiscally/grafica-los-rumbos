import React, { useState } from 'react';
import { orderService } from '../../services/api';

const NotificationPanel = () => {
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async (type) => {
    if (!orderId) {
      setMessage('Por favor ingresa un ID de pedido');
      return;
    }
    
    setLoading(true);
    try {
      await orderService.sendNotification(orderId, type);
      setMessage(`Notificación ${type} enviada exitosamente`);
    } catch (error) {
      setMessage(`Error al enviar notificación ${type}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-panel">
      <h2>Panel de Notificaciones</h2>
      
      <div className="notification-info">
        <p><strong>Nota:</strong> Este panel está configurado pero las notificaciones están simuladas.</p>
        <p>Para habilitar notificaciones reales, configura las variables de entorno para email (SMTP) y WhatsApp (Twilio).</p>
      </div>
      
      <div className="notification-form">
        <h3>Enviar Notificación a un Pedido</h3>
        
        <div className="form-group">
          <label htmlFor="orderId">ID del Pedido:</label>
          <input
            type="text"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Ingresa el ID del pedido"
          />
        </div>
        
        <div className="notification-buttons">
          <button 
            onClick={() => handleSendNotification('email')}
            disabled={loading}
            className="email-btn"
          >
            Enviar Email
          </button>
          
          <button 
            onClick={() => handleSendNotification('whatsapp')}
            disabled={loading}
            className="whatsapp-btn"
          >
            Enviar WhatsApp
          </button>
        </div>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="notification-setup">
        <h3>Configuración de Notificaciones</h3>
        
        <div className="setup-section">
          <h4>Email (SMTP)</h4>
          <pre className="config-example">
{`SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_password`}
          </pre>
        </div>
        
        <div className="setup-section">
          <h4>WhatsApp (Twilio)</h4>
          <pre className="config-example">
{`TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
