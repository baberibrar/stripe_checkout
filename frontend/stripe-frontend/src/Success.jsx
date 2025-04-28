import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Success = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Payment Successful! 🎉</h1>
      </header>
      <main>
        <div className="message-container">
          <p>Thank you for your purchase!</p>
          <p>We've sent you an email with your order details.</p>
          <Link to="/">
            <button className="back-button">Return to Shop</button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Success;
