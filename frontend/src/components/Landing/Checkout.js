// frontend/src/components/Landing/Checkout.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      navigate('/');
    }
    setCart(cartData);
  }, [navigate]);

  const updateQuantity = (productId, increment) => {
    const updatedCart = cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + increment);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    if (updatedCart.length === 0) {
      navigate('/');
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPhoneNumber = (phone) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
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
      const formattedPhone = formatPhoneNumber(customerInfo.phone);
      const fullName = `${customerInfo.name.trim()} ${customerInfo.lastname.trim()}`;
      
      const order = {
        customerName: fullName,
        customerEmail: customerInfo.email,
        customerPhone: formattedPhone,
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      await orderService.createOrder(order);
      
      setMessage('¡Pedido realizado con éxito! Recibirás un email de confirmación.');
      setMessageType('success');
      
      // Limpiar carrito
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      setMessage('Error al procesar el pedido. Intenta nuevamente.');
      setMessageType('error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid pt-5">
      <div className="container">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h3 font-weight-semi-bold">Finalizar Compra</h2>
              <Link to="/" className="btn btn-outline-secondary">
                <i className="fas fa-arrow-left mr-2"></i>
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Resumen del pedido */}
          <div className="col-lg-7">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Resumen del Pedido</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.productId}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.image && (
                                <img 
                                  src={item.image || '/placeholder.jpg'} 
                                  alt={item.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                />
                              )}
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>${formatPrice(item.price)}</td>
                          <td>
                            <div className="input-group" style={{ width: '120px' }}>
                              <div className="input-group-prepend">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.productId, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <i className="fas fa-minus"></i>
                                </button>
                              </div>
                              <input 
                                type="text" 
                                className="form-control text-center"
                                value={item.quantity}
                                readOnly
                              />
                              <div className="input-group-append">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.productId, 1)}
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>${formatPrice(item.price * item.quantity)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => removeItem(item.productId)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de datos del cliente */}
          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Información de Contacto</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label>Nombre <span className="text-danger">*</span></label>
                      <input 
                        type="text"
                        className="form-control"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label>Apellido <span className="text-danger">*</span></label>
                      <input 
                        type="text"
                        className="form-control"
                        name="lastname"
                        value={customerInfo.lastname}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email <span className="text-danger">*</span></label>
                    <input 
                      type="email"
                      className="form-control"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Teléfono <span className="text-danger">*</span></label>
                    <input 
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Ej: 11 2345-6789"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Resumen del total */}
                  <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Subtotal</h5>
                      <h5>${formatPrice(getTotal())}</h5>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <h5>Envío</h5>
                      <h5>A retirar en local</h5>
                    </div>
                    <div className="d-flex justify-content-between">
                      <h4>Total</h4>
                      <h4 className="text-primary">${formatPrice(getTotal())}</h4>
                    </div>
                  </div>

                  {/* Mensaje de estado */}
                  {message && (
                    <div className={`alert alert-${messageType === 'error' ? 'danger' : 'success'} mt-3`}>
                      <i className={`fas fa-${messageType === 'error' ? 'exclamation-circle' : 'check-circle'} mr-2`}></i>
                      {message}
                    </div>
                  )}

                  {/* Botón de envío */}
                  <button 
                    type="submit"
                    className="btn btn-primary btn-block mt-3"
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Confirmar Pedido
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;