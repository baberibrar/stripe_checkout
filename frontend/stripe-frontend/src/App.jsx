import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { makePayment } from "./stripe";

// Directly define some sample products for testing
const sampleProducts = [
  {
    id: "prod_1",
    name: "Basic T-shirt",
    description: "Comfortable cotton t-shirt",
    price: 2000,
    image: "https://i.imgur.com/EHyR2nP.png"
  },
  {
    id: "prod_2",
    name: "Premium Hoodie",
    description: "Warm winter hoodie",
    price: 4500,
    image: "https://i.imgur.com/JrNrb0F.png"
  },
  {
    id: "prod_3",
    name: "Denim Jeans",
    description: "Classic blue jeans",
    price: 3500,
    image: "https://i.imgur.com/tZGqFGt.png"
  }
];

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(`${PUBLISHABLE_KEY}`);

const ProductItem = ({ product, isSelected, onSelect }) => {
  const formattedPrice = (product.price / 100).toFixed(2);
  
  return (
    <div 
      className={`product-item ${isSelected ? 'selected' : ''}`} 
      onClick={() => onSelect(product)}
    >
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {isSelected && <span className="selected-badge">✓</span>}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p className="price">${formattedPrice}</p>
      </div>
    </div>
  );
};

const Message = ({ message }) => (
  <section className="message-container">
    <p>{message}</p>
    <button 
      className="back-button"
      onClick={() => window.location.href = '/'}
    >
      Back to Shop
    </button>
  </section>
);

export default function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products] = useState(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
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

  const handleCheckout = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }

    try {
      setIsLoading(true);
      const stripe = await stripePromise;

      console.log('Sending checkout request to the server...');
      const response = await fetch('http://localhost:4242/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: selectedProducts,
        }),
      });

      if (response.status === 401) {
        throw new Error('Authentication error: Please check your Stripe API keys');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong with the checkout process');
      }

      const session = await response.json();
      console.log('Checkout session response:', session);

      // If the server provided a direct URL, use that instead of redirectToCheckout
      if (session.url) {
        console.log('Redirecting to checkout URL:', session.url);
        window.location.href = session.url;
        return;
      }
      
      // Fallback to redirectToCheckout if URL is not provided
      // Redirect to Stripe Checkout
      console.log('Checkout session ID:', session.id);
      
      if (!session.id) {
        throw new Error('Failed to get valid session ID from the server');
      }
      
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error('Stripe redirect error:', result.error);
        throw new Error(result.error.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0) / 100; // Convert cents to dollars
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Shop Products</h1>
      </header>
      <main>
        {message ? (
          <Message message={message} />
        ) : (
          <div className="product-container">
            <div className="product-grid">
              {products.map(product => (
                <ProductItem 
                  key={product.id} 
                  product={product}
                  isSelected={selectedProducts.some(item => item.id === product.id)}
                  onSelect={handleProductSelect}
                />
              ))}
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="checkout-panel">
                <h3>Selected Products</h3>
                <ul className="selected-list">
                  {selectedProducts.map(product => (
                    <li key={product.id}>
                      {product.name} - ${(product.price / 100).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div className="total">
                  <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                </div>
                <button 
                  className="checkout-button"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing your order...</p>
        </div>
      )}
    </div>
  );
}