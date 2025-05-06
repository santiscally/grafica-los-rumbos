// ProductCard.js con enfoque Base64
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
    // Código existente para agregar al carrito
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

  return (
    <div className="product-card">
      {imageLoading ? (
        <div className="image-loading">Cargando imagen...</div>
      ) : (
        <img 
          src={imageData || '/placeholder-image.jpg'} 
          alt={product.name} 
          className="product-image"
        />
      )}
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <span className="product-year">{product.year}</span>
          <span className="product-subject">{product.subject}</span>
        </div>
        <div className="product-footer">
          <span className="product-price">${product.price}</span>
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToOrder}
          >
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;