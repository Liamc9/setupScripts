// StripePaymentForm.js
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ returnUrl, paymentElementOptions }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else {
        // Payment succeeded.
        alert('Payment succeeded!');
      }
    } catch (error) {
      setError('An error occurred during payment confirmation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={paymentElementOptions} className="mb-6" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-6 rounded-md text-white font-semibold transition ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </form>
  );
};

export default StripePaymentForm;