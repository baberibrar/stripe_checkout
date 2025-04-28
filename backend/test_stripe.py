import stripe

# This is your test secret API key from server.py
stripe.api_key = 'sk_test_51LNb'

try:
    # Try to list a small number of customers to check API connectivity
    customers = stripe.Customer.list(limit=1)
    print("Stripe API key is valid! Successfully connected to Stripe.")
    print(f"Retrieved {len(customers.data)} customer(s).")
except stripe.error.AuthenticationError:
    print("Stripe API key is invalid or expired. Please check your API key.")
except Exception as e:
    print(f"An error occurred: {str(e)}")
