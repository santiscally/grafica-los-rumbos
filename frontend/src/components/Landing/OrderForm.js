import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';

const OrderForm = () => {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setMessage('Agrega productos a tu pedido');
      return;
    }
    
    if (!customerInfo.email || !customerInfo.phone) {
      setMessage('Por favor completa todos los campos');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const order = {
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      await orderService.createOrder(order);
      
      setMessage('¡Pedido realizado con éxito! Recibirás notificaciones en tu email.');
      
      // Limpiar carrito
      localStorage.removeItem('cart');
      setCart([]);
      setCustomerInfo({ email: '', phone: '' });
      
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

  return (
    <div className="order-form">
      <h2>Tu Pedido</h2>
      
      {cart.length > 0 ? (
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>${item.price} cada uno</p>
              </div>
              <div className="cart-item-controls">
                <button 
                  onClick={() => updateQuantity(item.productId, -1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 1)}>+</button>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          
          <div className="total">
            <strong>Total: ${calculateTotal()}</strong>
          </div>
        </div>
      ) : (
        <p>No hay productos en tu pedido</p>
      )}
      
      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Teléfono:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
        </button>
      </form>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default OrderForm;