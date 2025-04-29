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
stripe.api_key = 'sk_test_'

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
        data = request.get_json()
        amount = data.get('amount', 0)
        currency = data.get('currency', 'gbp')
        submission_id = data.get('submission_id', None)
        
        if not amount:
            return jsonify({"error": "No payment amount provided"}), 400
        
        # Create checkout session with just the payment amount
        checkout_session = stripe.checkout.Session.create(
            payment_intent_data={
                'description': 'Payment for submission ID: {}'.format(submission_id) if submission_id else 'Payment for custom service',
            },
            submit_type='pay',
            mode='payment',
            success_url="http://localhost:5173/success",
            cancel_url="http://localhost:5173/cancel",
            payment_method_types=['card'],
            billing_address_collection='auto',
            line_items=[{
                'price_data': {
                    'currency': currency,
                    'product_data': {
                        'name': format('Payment for submission ID: {}', submission_id) if submission_id else 'Custom Service',
                        'description': 'Payment for custom service',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
        )
        
        return jsonify({"id": checkout_session.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(port=4242)