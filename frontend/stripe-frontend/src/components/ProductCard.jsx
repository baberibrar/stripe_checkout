import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, isSelected, onSelect }) => {
  const formattedPrice = (product.price / 100).toFixed(2);
  
  return (
    <div 
      className={`product-card ${isSelected ? 'selected' : ''}`} 
      onClick={() => onSelect(product)}
    >
      <div className="product-image">
        <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} />
        {isSelected && <div className="selected-badge">✓</div>}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-price">${formattedPrice}</div>
      </div>
    </div>
  );
};

export default ProductCard;
