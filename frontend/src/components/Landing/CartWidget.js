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
    <div className="cart-widget-container">
      <button 
        className="cart-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <i className="fas fa-shopping-cart"></i>
        {cartCount > 0 && (
          <span className="cart-badge">{cartCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            className="cart-overlay"
            onClick={() => setShowDropdown(false)}
          ></div>
          
          <div className="cart-dropdown">
            <div className="cart-header">
              <h5>
                <i className="fas fa-shopping-cart" style={{ marginRight: '10px' }}></i>
                Mi Carrito
              </h5>
              <button 
                className="cart-close"
                onClick={() => setShowDropdown(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <i className="fas fa-shopping-cart"></i>
                  <p>Tu carrito está vacío</p>
                  <small className="text-muted">Agrega productos para comenzar</small>
                </div>
              ) : (
                <>
                  {cartItems.map(item => (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <h6 className="cart-item-name">{item.name}</h6>
                        <div className="cart-item-details">
                          <span className="cart-item-price">
                            ${formatPrice(item.price)}
                          </span>
                          <span className="cart-item-quantity">
                            × {item.quantity}
                          </span>
                        </div>
                        <div className="cart-item-total">
                          Total: <strong>${formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      </div>
                      <button 
                        className="cart-item-remove"
                        onClick={() => removeItem(item.productId)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <strong>${formatPrice(getTotal())}</strong>
                </div>
                <Link 
                  to="/checkout" 
                  className="cart-checkout-btn"
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="fas fa-credit-card" style={{ marginRight: '10px' }}></i>
                  Finalizar Compra
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .cart-widget-container {
          position: relative;
        }

        .cart-button {
          position: relative;
          width: 48px;
          height: 48px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #343a40;
        }

        .cart-button:hover {
          border-color: #0d6efd;
          background: #f8f9fa;
          transform: scale(1.05);
        }

        .cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 22px;
          height: 22px;
          background: #dc3545;
          color: white;
          border-radius: 11px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1100;
          animation: fadeIn 0.2s ease;
        }

        .cart-dropdown {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 400px;
          height: calc(100vh - 50px);
          background: white;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
          z-index: 1101;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #dee2e6;
          background: #f8f9fa;
          flex-shrink: 0;
        }

        .cart-header h5 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #343a40;
          display: flex;
          align-items: center;
        }

        .cart-close {
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        .cart-close:hover {
          background: #e9ecef;
          color: #343a40;
        }

        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
        }

        .cart-empty i {
          font-size: 4rem;
          color: #dee2e6;
          margin-bottom: 1rem;
        }

        .cart-empty p {
          font-size: 1.125rem;
          font-weight: 500;
          color: #6c757d;
          margin-bottom: 0.5rem;
        }

        .cart-item {
          display: flex;
          padding: 1rem;
          border: 1px solid #dee2e6;
          border-radius: 10px;
          margin-bottom: 10px;
          transition: all 0.2s;
          background: white;
        }

        .cart-item:hover {
          border-color: #adb5bd;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .cart-item:last-child {
          margin-bottom: 0;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-item-details {
          display: flex;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }

        .cart-item-price {
          font-weight: 500;
        }

        .cart-item-quantity {
          color: #0d6efd;
          font-weight: 500;
        }

        .cart-item-total {
          font-size: 0.875rem;
          color: #343a40;
        }

        .cart-item-total strong {
          color: #0d6efd;
        }

        .cart-item-remove {
          width: 36px;
          height: 36px;
          border: none;
          background: #fee2e2;
          color: #dc3545;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-left: 0.75rem;
        }

        .cart-item-remove:hover {
          background: #dc3545;
          color: white;
        }

        .cart-footer {
          border-top: 1px solid #dee2e6;
          padding: 1.5rem;
          background: #f8f9fa;
          flex-shrink: 0;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 1.125rem;
          color: #343a40;
        }

        .cart-total strong {
          font-size: 1.5rem;
          color: #0d6efd;
        }

        .cart-checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-checkout-btn:hover {
          background: #0b5ed7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
          color: white;
        }

        @media (max-width: 575px) {
          .cart-dropdown {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CartWidget;