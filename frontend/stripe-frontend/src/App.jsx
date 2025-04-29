import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import "./App.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(`${PUBLISHABLE_KEY}`);

const Message = ({ message }) => (
  <section className="message-container">
    <p>{message}</p>
    <button 
      className="back-button"
      onClick={() => window.location.href = '/'}
    >
      Back to Payment
    </button>
  </section>
);

export default function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Payment successful! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage(
        "Payment canceled -- you can try again when you're ready."
      );
    }
  }, []);

  const handleAmountChange = (e) => {
    // Only allow numeric input with up to 2 decimal places
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };

  const handleCheckout = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setIsLoading(true);
      const stripe = await stripePromise;

      // Convert amount to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(parseFloat(amount) * 100);

      console.log('Sending checkout request to the server...');
      const response = await fetch('http://localhost:4242/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              name: "Custom Payment",
              description: "One-time payment",
              price: amountInCents,
              currency: "gbp",
              tax_behavior: "exclusive",
              quantity: 1
            }
          ],
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Payment Form</h1>
      </header>
      <main>
        {message ? (
          <Message message={message} />
        ) : (
          <div className="payment-container">
            <div className="payment-form">
              <h2>Enter Payment Amount</h2>
              <div className="amount-input-container">
                <span className="currency-symbol">£</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="amount-input"
                />
              </div>
              <button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Pay Now
              </button>
            </div>
          </div>
        )}
      </main>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing your payment...</p>
        </div>
      )}
    </div>
  );
}