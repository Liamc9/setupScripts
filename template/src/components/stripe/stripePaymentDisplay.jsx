// StripePaymentDisplay.js
import React from 'react';
import StripePaymentIntent from './stripePaymentIntent';

const StripePaymentDisplay = ({
  useCustomer,
  customerEmail,
  attachPaymentMethod,
  currency,
  destinationAccount,
  price = 100.00,
}) => {

  
  const appearance = {
    theme: 'flat',
    variables: {
      colorPrimary: '#6772e5',
      colorBackground: '#f6f9fc',
      colorText: '#32325d',
      borderRadius: '4px',
      spacingUnit: '4px',
      fontFamily: 'Roboto, sans-serif',
    },
  };

  const paymentElementOptions = {
    defaultValues: {
      billingDetails: {
        address: {
          country: 'US',
        },
      },
    },
  };

  return (
    <div>
      <StripePaymentIntent
        amount={price * 100} // Convert price to cents.
        currency={currency}
        returnUrl="http://localhost:3000/success"
        email={useCustomer ? customerEmail : null}
        createCustomer={useCustomer}
        attachPaymentMethod={attachPaymentMethod}
        destinationAccount={destinationAccount}
        appearance={appearance}
        paymentElementOptions={paymentElementOptions}
      />
    </div>
  );
};

export default StripePaymentDisplay;