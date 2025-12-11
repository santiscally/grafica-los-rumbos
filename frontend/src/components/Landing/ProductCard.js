// frontend/src/components/Landing/ProductCard.js
import React from 'react';

const ProductCard = ({ product }) => {
  const handleAddToOrder = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const imageUrl = product.hasImage 
    ? `${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}`
    : '/placeholder.jpg';

  return (
    <>
      <div className="product-card">
        {/* Header con imagen */}
        <div className="product-card-image">
          <img 
            src={imageUrl} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
          {/* Badge de año */}
          <span className="badge-year">{product.year}</span>
          {/* Badge de código - NUEVO */}
          {product.code && (
            <span className="badge-code">{product.code}</span>
          )}
        </div>
        
        {/* Contenido de la tarjeta */}
        <div className="product-card-body">
          {/* Categoría */}
          <span className="product-category">{product.subject}</span>
          
          {/* Título */}
          <h3 className="product-title">{product.name}</h3>
          
          {/* Descripción */}
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}
          
          {/* Precio y botón */}
          <div className="product-card-footer">
            <span className="product-price">
              ${formatPrice(product.price)}
            </span>
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToOrder}
            >
              <i className="fas fa-cart-plus"></i>
              Agregar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        /* Imagen más cuadrada */
        .product-card-image {
          position: relative;
          width: 100%;
          padding-top: 75%; /* Aspect ratio 4:3 más cuadrado */
          background: #f3f4f6;
          overflow: hidden;
        }

        .product-card-image img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .product-card:hover .product-card-image img {
          transform: scale(1.05);
        }

        /* Badge de año - esquina superior izquierda */
        .badge-year {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 0.35rem 0.75rem;
          background: #0d6efd;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
          z-index: 2;
        }

        /* Badge de código - esquina superior derecha */
        .badge-code {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 0.35rem 0.75rem;
          background: #111827;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          font-family: 'Monaco', 'Consolas', monospace;
          border-radius: 6px;
          z-index: 2;
          letter-spacing: 0.5px;
        }

        .product-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-category {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          width: fit-content;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 1rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .product-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid #f3f4f6;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0d6efd;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
        }

        .add-to-cart-btn i {
          font-size: 0.9rem;
        }

        /* Responsive - cards aún más compactas en mobile */
        @media (max-width: 575px) {
          .product-card-image {
            padding-top: 70%; /* Aún más cuadrado en mobile */
          }

          .product-card-body {
            padding: 0.875rem;
          }

          .product-title {
            font-size: 0.9375rem;
          }

          .product-price {
            font-size: 1.125rem;
          }

          .add-to-cart-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.8125rem;
          }

          .add-to-cart-btn span {
            display: none;
          }

          .badge-year,
          .badge-code {
            padding: 0.25rem 0.5rem;
            font-size: 0.6875rem;
          }
        }
      `}</style>
    </>
  );
};

export default ProductCard;