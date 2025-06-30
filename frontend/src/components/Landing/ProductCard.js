// frontend/src/components/Landing/ProductCard.js - ARCHIVO COMPLETO
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

  // Usar la nueva ruta para las imágenes
  const imageUrl = product.hasImage 
    ? `${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}`
    : '/placeholder.jpg';

  return (
    <div className="card h-100 product-card-enhanced">
      {/* Header con imagen */}
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.jpg';
          }}
        />
        {/* Badge de año */}
        <span className="position-absolute top-0 start-0 m-3 badge bg-primary">
          {product.year}
        </span>
      </div>
      
      {/* Contenido de la tarjeta */}
      <div className="card-body d-flex flex-column">
        {/* Categoría */}
        <div className="mb-2">
          <span className="badge bg-secondary">{product.subject}</span>
        </div>
        
        {/* Título */}
        <h5 className="card-title fw-semibold mb-2">{product.name}</h5>
        
        {/* Descripción */}
        <p className="card-text text-muted small flex-grow-1">
          {product.description}
        </p>
        
        {/* Código de producto - Nueva sección más visible */}
        {product.code && (
          <div className="product-code-section mb-3 p-2 bg-light rounded">
            <small className="text-muted d-block mb-1">Código de producto:</small>
            <span className="h5 mb-0 fw-bold text-dark">{product.code}</span>
          </div>
        )}
        
        {/* Precio */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="h4 mb-0 text-primary fw-bold">
            ${formatPrice(product.price)}
          </span>
        </div>
      </div>
      
      {/* Footer con botón */}
      <div className="card-footer bg-transparent">
        <button 
          className="btn btn-primary w-100"
          onClick={handleAddToOrder}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;