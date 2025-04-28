import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Cancel = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Payment Cancelled</h1>
      </header>
      <main>
        <div className="message-container">
          <p>Your order has been cancelled.</p>
          <p>No charges have been made to your account.</p>
          <Link to="/">
            <button className="back-button">Return to Shop</button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Cancel;
