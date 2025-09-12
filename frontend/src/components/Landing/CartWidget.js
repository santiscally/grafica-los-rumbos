// frontend/src/components/Landing/CartWidget.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CartWidget = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  const updateCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
    setCartItems(cart);
  };

  const removeItem = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="position-relative">
      <button 
        className="btn border"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fas fa-shopping-cart text-primary"></i>
        <span className="badge">{cartCount}</span>
      </button>

      {showDropdown && (
        <div 
          className="dropdown-menu dropdown-menu-right show"
          style={{ 
            position: 'absolute', 
            right: 0, 
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {cartItems.length === 0 ? (
            <div className="text-center py-3">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.productId} className="dropdown-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{item.name}</h6>
                      <small className="text-muted">
                        ${formatPrice(item.price)} x {item.quantity}
                      </small>
                    </div>
                    <div className="text-right">
                      <strong>${formatPrice(item.price * item.quantity)}</strong>
                      <button 
                        className="btn btn-sm btn-link text-danger p-0 ml-2"
                        onClick={() => removeItem(item.productId)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="dropdown-divider"></div>
              <div className="px-3 py-2">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total:</strong>
                  <strong className="text-primary">${formatPrice(getTotal())}</strong>
                </div>
                <Link 
                  to="/checkout" 
                  className="btn btn-primary btn-block"
                  onClick={() => setShowDropdown(false)}
                >
                  Finalizar Compra
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartWidget;