import React, { useState } from 'react';
import { orderService } from '../../services/api';

const NotificationPanel = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  const handleSendNotification = async (type) => {
    if (!orderId) {
      setMessage('Por favor ingrese un ID de pedido');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    try {
      await orderService.sendNotification(orderId, type);
      setMessage(`Notificación ${type === 'email' ? 'por correo electrónico' : 'por WhatsApp'} enviada exitosamente`);
      setMessageType('success');
    } catch (error) {
      setMessage(`Error al enviar notificación: ${error.message || 'Intente nuevamente'}`);
      setMessageType('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage(null);
    setMessageType('');
  };

  return (
    <div className="notification-panel">
      {/* Información sobre las notificaciones */}
      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading">
          <i className="fas fa-info-circle me-2"></i>
          Notificaciones Simuladas
        </h4>
        <p>
          Este sistema está configurado para simular el envío de notificaciones en el entorno de desarrollo.
          Para habilitar el envío real de notificaciones, es necesario configurar las variables de entorno 
          para servicios de email (SMTP) y WhatsApp (Twilio).
        </p>
      </div>

      {/* Mensajes de éxito o error */}
      {message && (
        <div className={`alert alert-${messageType === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          <i className={`fas fa-${messageType === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {message}
          <button type="button" className="btn-close" onClick={clearMessage}></button>
        </div>
      )}

      {/* Formulario para enviar notificaciones */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Enviar Notificación</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="orderId" className="form-label">ID del Pedido:</label>
            <input
              type="text"
              className="form-control"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ingrese el ID del pedido"
            />
          </div>
          
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => handleSendNotification('email')}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-envelope me-2"></i>
                  Enviar por Email
                </>
              )}
            </button>
            
            <button
              className="btn btn-success"
              onClick={() => handleSendNotification('whatsapp')}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fab fa-whatsapp me-2"></i>
                  Enviar por WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Información de configuración */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Configuración de Notificaciones</h5>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h6 className="fw-bold">Email (SMTP)</h6>
            <div className="bg-light p-3 rounded">
              <pre className="mb-0 text-secondary small">
{`SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_password`}
              </pre>
            </div>
          </div>
          
          <div className="mb-4">
            <h6 className="fw-bold">WhatsApp (Twilio)</h6>
            <div className="bg-light p-3 rounded">
              <pre className="mb-0 text-secondary small">
{`TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number`}
              </pre>
            </div>
          </div>
          
          <div className="alert alert-info" role="alert">
            <i className="fas fa-lightbulb me-2"></i>
            <strong>Nota:</strong> Para habilitar las notificaciones, agregue estas variables al archivo .env en la raíz del proyecto backend.
            Luego reinicie el servidor para que tome los cambios.
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;