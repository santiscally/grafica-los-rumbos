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

  const updateQuantity = (productId, delta) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
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
    <>
      <div className="cart-widget">
        <button 
          className="cart-trigger"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Carrito de compras"
        >
          <i className="fas fa-shopping-cart"></i>
          <span className="cart-text">Carrito</span>
          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>

        {showDropdown && (
          <>
            <div 
              className="cart-backdrop"
              onClick={() => setShowDropdown(false)}
            />
            
            <div className="cart-panel">
              <div className="cart-panel-header">
                <h4>
                  <i className="fas fa-shopping-cart"></i>
                  Mi Carrito
                </h4>
                <button 
                  className="cart-close"
                  onClick={() => setShowDropdown(false)}
                  aria-label="Cerrar carrito"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="cart-panel-body">
                {cartItems.length === 0 ? (
                  <div className="cart-empty">
                    <div className="cart-empty-icon">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <h5>Tu carrito esta vacio</h5>
                    <p>Agrega productos para comenzar</p>
                  </div>
                ) : (
                  <div className="cart-items">
                    {cartItems.map(item => (
                      <div key={item.productId} className="cart-item">
                        <div className="cart-item-content">
                          <h6>{item.name}</h6>
                          <div className="cart-item-meta">
                            <span className="cart-item-price">
                              ${formatPrice(item.price)}
                            </span>
                            <span className="cart-item-multiply">x</span>
                            <div className="cart-item-quantity">
                              <button 
                                onClick={() => updateQuantity(item.productId, -1)}
                                aria-label="Disminuir cantidad"
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <span>{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, 1)}
                                aria-label="Aumentar cantidad"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                          <div className="cart-item-subtotal">
                            Subtotal: <strong>${formatPrice(item.price * item.quantity)}</strong>
                          </div>
                        </div>
                        <button 
                          className="cart-item-delete"
                          onClick={() => removeItem(item.productId)}
                          aria-label="Eliminar producto"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="cart-panel-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <strong>${formatPrice(getTotal())}</strong>
                  </div>
                  <Link 
                    to="/checkout" 
                    className="cart-checkout"
                    onClick={() => setShowDropdown(false)}
                  >
                    <i className="fas fa-credit-card"></i>
                    Finalizar Compra
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cart-widget {
          position: relative;
        }

        .cart-trigger {
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          color: #374151;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cart-trigger:hover {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .cart-text {
          display: none;
        }

        .cart-count {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dc2626;
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 10px;
          padding: 0 5px;
          border: 2px solid white;
        }

        .cart-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1100;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cart-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 400px;
          height: 100%;
          background: white;
          z-index: 1101;
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s ease;
          box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .cart-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .cart-panel-header h4 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .cart-panel-header h4 i {
          color: #0d6efd;
        }

        .cart-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cart-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .cart-panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
        }

        .cart-empty-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
          margin-bottom: 1.5rem;
        }

        .cart-empty-icon i {
          font-size: 2rem;
          color: #d1d5db;
        }

        .cart-empty h5 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .cart-empty p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9375rem;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cart-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
        }

        .cart-item:hover {
          border-color: #d1d5db;
        }

        .cart-item-content {
          flex: 1;
          min-width: 0;
        }

        .cart-item-content h6 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-item-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .cart-item-price {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .cart-item-multiply {
          color: #9ca3af;
        }

        .cart-item-quantity {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .cart-item-quantity button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 0.625rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cart-item-quantity button:hover {
          color: #0d6efd;
          background: #f3f4f6;
        }

        .cart-item-quantity span {
          min-width: 24px;
          text-align: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .cart-item-subtotal {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .cart-item-subtotal strong {
          color: #0d6efd;
        }

        .cart-item-delete {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fee2e2;
          border: none;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          align-self: flex-start;
        }

        .cart-item-delete:hover {
          background: #dc2626;
          color: white;
        }

        .cart-panel-footer {
          padding: 1.25rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .cart-total span {
          font-size: 1rem;
          color: #374151;
        }

        .cart-total strong {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0d6efd;
        }

        .cart-checkout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cart-checkout:hover {
          background: #0b5ed7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13,110,253,0.3);
          color: white;
        }

        @media (max-width: 575px) {
          .cart-panel {
            max-width: 100%;
          }

          .cart-trigger {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .cart-count {
            top: -4px;
            right: -4px;
            min-width: 18px;
            height: 18px;
            font-size: 0.625rem;
          }
        }
      `}</style>
    </>
  );
};

export default CartWidget;