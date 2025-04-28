# Stripe Checkout Integration Project

This project demonstrates a full-stack e-commerce application with Stripe Checkout integration. It consists of a Python Flask backend and a React frontend, allowing users to browse products and complete payments through Stripe's secure checkout process.

## Project Structure

```
stripe_checkout/
├── backend/               # Flask server and API endpoints
│   ├── products.py        # Product data
│   ├── server.py          # Main Flask application with Stripe integration
│   └── test_stripe.py     # Tests for Stripe functionality
├── frontend/              # React frontend application
│   └── stripe-frontend/   # React application
│       ├── src/           # Source code
│       │   ├── components/# React components
│       │   ├── App.jsx    # Main application component
│       │   ├── stripe.js  # Stripe client integration
│       │   └── ...        # Other React components & assets
│       ├── package.json   # Frontend dependencies
│       └── ...            # Configuration files
└── .gitignore             # Git ignore configuration
```

## Backend (Flask + Stripe)

The backend is built with Flask and integrates with Stripe's API for payment processing.

### Key Features

- **REST API endpoints** for:
  - Product listings (`/api/products`)
  - Checkout session creation (`/api/create-checkout-session`)
- **Stripe Integration** for secure payment handling
- **CORS Configuration** to allow frontend communication

### Technical Components

- **Flask**: Lightweight web framework for Python
- **Flask-CORS**: Handles Cross-Origin Resource Sharing
- **Stripe Python Library**: Interacts with Stripe's payment API

### How to Run the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install flask flask-cors stripe
   ```

3. Set up your Stripe API key:
   - Replace the placeholder API key in `server.py` with your actual Stripe test key
   - Or set it as an environment variable

4. Start the server:
   ```
   python server.py
   ```

The backend server will start at `http://localhost:4242`.

## Frontend (React + Vite)

The frontend is built with React and Vite, providing a modern UI for browsing products and initiating the checkout process.

### Key Features

- **Product Catalog**: Displays available products from the backend
- **Shopping Cart**: Allows users to select products and quantities
- **Stripe Checkout Integration**: Redirects users to Stripe's hosted checkout
- **Success/Cancel Pages**: Handles payment confirmation and cancellation

### Technical Components

- **React**: UI library for building the user interface
- **Vite**: Modern frontend build tool and development server
- **Stripe.js**: Client-side library for Stripe integration

### How to Run the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend/stripe-frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or if using bun
   bun install
   ```

3. Start the development server:
   ```
   npm run dev
   # or if using bun
   bun run dev
   ```

The frontend will be available at `http://localhost:5173`.

## Complete Checkout Flow

1. User browses products on the frontend
2. User selects products and proceeds to checkout
3. Frontend sends selected items to the backend
4. Backend creates a Stripe checkout session
5. Frontend redirects to Stripe's hosted checkout page
6. User completes payment on Stripe's secure page
7. Stripe redirects user back to success or cancel page
8. Success page confirms the order was completed

## Security Considerations

- Stripe API keys are kept on the server side only
- Payment details are handled entirely by Stripe's secure checkout
- CORS is configured to allow only the frontend domain

## Development Notes

- This project uses Stripe's test mode - no real payments are processed
- For production, update the Stripe API keys and domain URLs
- Consider implementing additional features like:
  - User authentication
  - Order history
  - Inventory management
  - Email confirmations

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
