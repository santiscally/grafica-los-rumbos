import React, { useState, useEffect } from 'react';
import { fileService } from '../../services/api';
import '../../styles/products.css';

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

  // Formatear precio con separadores de miles
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {imageLoading ? (
          <div className="image-loading">
            <div className="image-spinner"></div>
          </div>
        ) : (
          <img 
            src={imageData || '/placeholder-image.jpg'} 
            alt={product.name} 
            className="product-image"
          />
        )}
        <div className="product-badge">
          <span>{product.year}</span>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">
          <span>{product.subject}</span>
        </div>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">${formatPrice(product.price)}</div>
          <button 
            className="add-button"
            onClick={handleAddToOrder}
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;