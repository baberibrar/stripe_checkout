import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ onCheckout }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const response = await fetch('http://localhost:4242/api/products');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('Products data:', data);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProducts(prevSelected => {
      // Check if the product is already selected
      const isAlreadySelected = prevSelected.some(item => item.id === product.id);
      
      if (isAlreadySelected) {
        // If already selected, remove it
        return prevSelected.filter(item => item.id !== product.id);
      } else {
        // If not selected, add it
        return [...prevSelected, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prevSelected => 
      prevSelected.map(item => 
        item.id === productId ? { ...item, quantity: parseInt(quantity) || 1 } : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0) / 100; // Convert cents to dollars
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <h2>Select Products</h2>
      <div className="product-list">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            isSelected={selectedProducts.some(item => item.id === product.id)}
            onSelect={handleProductSelect}
          />
        ))}
      </div>
      
      {selectedProducts.length > 0 && (
        <div className="selected-products">
          <h3>Selected Products</h3>
          <table className="selected-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>${(item.price / 100).toFixed(2)}</td>
                  <td>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </td>
                  <td>${((item.price * item.quantity) / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label">Total:</td>
                <td className="total-amount">${calculateTotal().toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <button 
            className="checkout-button"
            onClick={() => onCheckout(selectedProducts)}
            disabled={selectedProducts.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
