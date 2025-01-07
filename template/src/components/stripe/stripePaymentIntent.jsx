// StripePaymentIntent.js
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './stripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51O3czXKxgc2qiaBtAHRNuIK0QjCUYFkXCU1MlYZi2jmXgCXWdOWs5u19Ix0QA8Qql4KMWQR8VReJOUBLzFAyzwjI00C8Txxqk4');

const StripePaymentIntent = ({
  amount,
  currency,
  returnUrl,
  email,
  createCustomer,
  attachPaymentMethod,
  destinationAccount,
  appearance,
  paymentElementOptions,
}) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the PaymentIntent client secret when the component mounts.
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch('https://us-central1-demopractice1-421ad.cloudfunctions.net/createPaymentIntentWithCustomer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            email,
            createCustomer,
            attachPaymentMethod,
            destinationAccount,
          }),
        });

        const data = await response.json();

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Failed to retrieve payment details.');
        }
      } catch (error) {
        console.error('Error fetching payment intent:', error);
        setError('An error occurred while retrieving payment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [
    amount,
    currency,
    email,
    createCustomer,
    attachPaymentMethod,
    destinationAccount,
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-600">{error}</div>;

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm
        returnUrl={returnUrl}
        paymentElementOptions={paymentElementOptions}
      />
    </Elements>
  );
};

export default StripePaymentIntent;