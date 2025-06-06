import React, { useState, useEffect } from 'react';
import { fileService } from '../../services/api';

const ProductCard = ({ product }) => {
  const [imageData, setImageData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  
  useEffect(() => {
    const loadImage = async () => {
      if (product.image) {
        try {
          setImageLoading(true);
          const data = await fileService.getFileBase64(product.image);
          setImageData(data.data);
        } catch (error) {
          console.error('Error cargando imagen:', error);
        } finally {
          setImageLoading(false);
        }
      }
    };
    
    loadImage();
  }, [product.image]);

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

  return (
    <div className="card h-100 product-card-enhanced">
      {/* Header con imagen */}
      <div className="product-image-container">
        {imageLoading ? (
          <div className="d-flex align-items-center justify-content-center h-100 bg-light">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <img 
            src={imageData || '/placeholder.jpg'} 
            alt={product.name} 
            className="product-image"
          />
        )}
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
        
        {/* Precio */}
        <div className="d-flex justify-content-between align-items-center mt-3">
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
          Solicitar Presupuesto
        </button>
      </div>
    </div>
  );
};

export default ProductCard;