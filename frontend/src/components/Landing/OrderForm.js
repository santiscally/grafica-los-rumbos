import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import '../../styles/forms.css';

const OrderForm = () => {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    updateCart();
    
    const handleCartUpdate = () => {
      updateCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCart();
  };

  const updateQuantity = (productId, increment) => {
    const updatedCart = cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + increment;
        return { ...item, quantity: Math.max(1, newQuantity) };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    updateCart();
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Función para formatear el número de teléfono
  const formatPhoneNumber = (phone) => {
    // Eliminar todo excepto números y el signo +
    return phone.replace(/[^\d+]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setMessage('Agrega productos a tu pedido');
      return;
    }
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setMessage('Por favor completa todos los campos');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Formatear el teléfono antes de enviar
      const formattedPhone = formatPhoneNumber(customerInfo.phone);
      
      const order = {
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: formattedPhone,
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      await orderService.createOrder(order);
      
      setMessage('¡Pedido realizado con éxito! Recibirás un email de confirmación.');
      
      // Limpiar carrito
      localStorage.removeItem('cart');
      setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '' });
      
    } catch (error) {
      setMessage('Error al procesar el pedido. Intenta nuevamente.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    // Permitir solo números, espacios, guiones, paréntesis y el signo +
    const filteredValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
    setCustomerInfo(prev => ({
      ...prev,
      phone: filteredValue
    }));
  };

  return (
    <div className="order-form-container">
      <h2 className="order-form-title">
        <i className="fas fa-shopping-cart"></i> Tu Pedido
      </h2>
      
      {cart.length > 0 ? (
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p className="cart-item-price">${formatPrice(item.price)}</p>
              </div>
              <div className="cart-item-controls">
                <button 
                  className="quantity-btn minus"
                  onClick={() => updateQuantity(item.productId, -1)}
                  disabled={item.quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn plus"
                  onClick={() => updateQuantity(item.productId, 1)}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId)}
                  title="Eliminar"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
          
          <div className="order-total">
            <span>Total:</span>
            <span>${formatPrice(calculateTotal())}</span>
          </div>
        </div>
      ) : (
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <p>Tu carrito está vacío</p>
          <small>Agrega productos para realizar un pedido</small>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="order-customer-form">
        <div className="form-header">
          <h3>Información de contacto</h3>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">
            <i className="fas fa-user"></i> Nombre:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i> Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleChange}
            placeholder="Tu correo electrónico"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">
            <i className="fas fa-phone-alt"></i> Teléfono:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handlePhoneChange}
            placeholder="Tu número de teléfono"
            required
          />
          <small style={{color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
            Ejemplo: 11 2345-6789 o +54 11 2345-6789
          </small>
        </div>
        
        <button 
          type="submit" 
          className="order-submit-btn"
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Procesando...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Realizar Pedido
            </>
          )}
        </button>
      </form>
      
      {message && (
        <div className={`order-message ${message.includes('Error') ? 'error' : 'success'}`}>
          <i className={message.includes('Error') ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}></i>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default OrderForm;