// frontend/src/components/Landing/Checkout.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';
import Footer from '../Common/Footer';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', lastname: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) navigate('/');
    setCart(cartData);
  }, [navigate]);

  const updateQuantity = (productId, increment) => {
    const updatedCart = cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + increment) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    if (updatedCart.length === 0) navigate('/');
  };

  const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.lastname || !customerInfo.email || !customerInfo.phone) {
      setMessage('Por favor completa todos los campos');
      setMessageType('error');
      return;
    }
    setIsSubmitting(true);
    try {
      const order = {
        customerName: `${customerInfo.name.trim()} ${customerInfo.lastname.trim()}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone.replace(/[^\d+]/g, ''),
        products: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
      };
      await orderService.createOrder(order);
      setMessage('¡Pedido realizado con éxito! Recibirás un email de confirmación.');
      setMessageType('success');
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setMessage('Error al procesar el pedido. Intenta nuevamente.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb', width: '100%' };
  const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' };
  const cardHeaderStyle = { padding: '1.25rem 1.5rem', borderBottom: '2px solid #e5e7eb', background: '#f8f9fa' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header fijo */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderBottom: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', background: '#f8f9fa' }}>
                <i className="fas fa-arrow-left"></i><span>Volver</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>Finalizar Compra</h1>
              </div>
            </div>
            <span style={{ background: '#e3f2fd', color: '#0d6efd', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
              <i className="fas fa-box" style={{ marginRight: '8px' }}></i>{cart.length} producto{cart.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container py-4">
          <div className="row g-4">
            {/* Resumen del pedido */}
            <div className="col-lg-7">
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h5 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-list-ul" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Resumen del Pedido
                  </h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {cart.map(item => (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '10px', marginBottom: '0.75rem' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem' }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h6 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h6>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                          <span style={{ color: '#6c757d' }}>${formatPrice(item.price)} c/u</span>
                          <span style={{ color: '#0d6efd', fontWeight: 600 }}>Total: ${formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                          <button onClick={() => updateQuantity(item.productId, -1)} disabled={item.quantity <= 1} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.5 : 1 }}>
                            <i className="fas fa-minus" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                          <span style={{ padding: '0 1rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: 'pointer' }}>
                            <i className="fas fa-plus" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} style={{ width: '36px', height: '36px', border: 'none', background: '#fee', color: '#dc3545', borderRadius: '8px', cursor: 'pointer' }} title="Eliminar">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="col-lg-5">
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <h5 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-user" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Información de Contacto
                  </h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Nombre <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange} required disabled={isSubmitting} style={inputStyle} />
                      </div>
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Apellido <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="text" name="lastname" value={customerInfo.lastname} onChange={handleInputChange} required disabled={isSubmitting} style={inputStyle} />
                      </div>
                      <div className="col-12">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required disabled={isSubmitting} style={inputStyle} />
                      </div>
                      <div className="col-12">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Teléfono <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} placeholder="Ej: 11 2345-6789" required disabled={isSubmitting} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: '#6c757d' }}>Subtotal</span>
                        <span style={{ fontWeight: 500 }}>${formatPrice(getTotal())}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#6c757d' }}>Envío</span>
                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 500 }}>
                          <i className="fas fa-store" style={{ marginRight: '6px' }}></i>Retiro en local
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#e3f2fd', borderRadius: '10px' }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d6efd' }}>${formatPrice(getTotal())}</span>
                      </div>
                    </div>

                    {message && (
                      <div style={{ padding: '1rem', borderRadius: '10px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: messageType === 'error' ? '#fee' : '#e8f5e9', color: messageType === 'error' ? '#dc3545' : '#2e7d32' }}>
                        <i className={`fas fa-${messageType === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
                        <span>{message}</span>
                      </div>
                    )}

                    <button type="submit" disabled={isSubmitting || cart.length === 0} style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', background: isSubmitting ? '#6c757d' : '#0d6efd', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {isSubmitting ? (<><span className="spinner-border spinner-border-sm"></span>Procesando...</>) : (<><i className="fas fa-check"></i>Confirmar Pedido</>)}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;