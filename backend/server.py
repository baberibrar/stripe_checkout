#! /usr/bin/env python3.6

"""
server.py
Stripe Sample.
Python 3.6 or newer required.
"""
import os
from flask import Flask, redirect, request, jsonify
from flask_cors import CORS

import stripe
# This is your test secret API key.
stripe.api_key = 'sk_test_51LNbBABYqXdhUoZaoBo2QHRJnn'

# Import the products list from the products module
from products import products

app = Flask(__name__,
            static_url_path='',
            static_folder='public')
            
# Enable CORS with proper configuration
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

YOUR_DOMAIN = 'http://localhost:5173'

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)

@app.route('/api/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json

        items = data.get('items', [])
        
        if not items:
            return jsonify({"error": "No items selected"}), 400
              line_items = []
        
        for item in items:
            product_id = item.get('id')
            quantity = item.get('quantity', 1)
            # Find the product in our list
            product = next((p for p in products if p['id'] == product_id), None)
            
            if not product:
                return jsonify({"error": f"Product with ID {product_id} not found"}), 400
            
            # Directly use the product information for line_items without creating Product/Price objects
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': product['price'],
                    'product_data': {
                        'name': product['name'],
                        'description': product.get('description', ''),
                        'images': [product.get('image')] if product.get('image') else []
                    },
                },
                'quantity': quantity,
            })
            
        # Create checkout session after processing all items
        checkout_session = stripe.checkout.Session.create(
            line_items=line_items,
            mode='payment',
            success_url="http://localhost:5173/success",
            cancel_url="http://localhost:5173/cancel",
            payment_method_types=['card'],
            billing_address_collection='auto',
        )
        print(f"Checkout session created: {checkout_session.id}")
        return jsonify({
            "id": checkout_session.id
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "error": str(e),
            "errorType": type(e).__name__
        }), 400


if __name__ == '__main__':
    app.run(port=4242)