import { loadStripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const Base_url = import.meta.env.VITE_BASE_URL;

export const makePayment = async (products) => {
  try {
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network and try again.");
    }

    const stripe = await loadStripe(PUBLISHABLE_KEY);    const body = { items: products };
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Attempt ${attempt}: Fetching ${url}`);
          const response = await fetch(url, options);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}): ${errorText}`);
            throw new Error(`API Error (${response.status}): Please check the console for details.`);
          }
          
          return await response.json();
        } catch (error) {
          if (!navigator.onLine) {
            console.warn("You are offline. Waiting for internet connection...");
            await new Promise((res) => setTimeout(res, 3000));
            continue;
          }

          if (attempt === retries) throw error;
          console.warn(`Retry ${attempt}/${retries} failed. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
        }
      }
    };

    const session = await fetchWithRetry(`${Base_url}/api/create-checkout-session`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });    if (session?.id) {
      console.log("Redirecting to Stripe Checkout with session ID:", session.id);
      const result = await stripe.redirectToCheckout({ 
        sessionId: session.id 
      });
      
      if (result.error) {
        console.error("Stripe redirectToCheckout error:", result.error);
        throw new Error(result.error.message || "Failed to redirect to Stripe Checkout.");
      }
    } else {
      throw new Error("Failed to create checkout session. No session ID received.");
    }
  } catch (error) {
    alert(error.message);
  }
};
