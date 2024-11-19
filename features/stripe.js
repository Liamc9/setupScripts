// features/stripe.js
const fs = require("fs");
const path = require("path");
const { executeCommand } = require("../utils");

// Get the project directory from command-line arguments
const appDirectory = process.argv[2];
if (!appDirectory) {
  console.error("Please provide the path to your React app directory.");
  process.exit(1);
}

(async function addStripeIntegration() {
  console.log("\n--- Adding Stripe Integration ---");

  // Install Stripe packages
  executeCommand("npm install @stripe/react-stripe-js @stripe/stripe-js", {
    cwd: appDirectory,
  });

  // Define the paths for the files to be created
  const componentsDir = path.join(appDirectory, "src", "components");
  const srcDir = path.join(appDirectory, "src");

  // Ensure the components directory exists
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
    console.log(`Created directory: ${componentsDir}`);
  }

  // Create stripePaymentDisplay.jsx
  const displayComponentPath = path.join(componentsDir, "stripePaymentDisplay.jsx");
  const displayComponentContent = `
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
  `;
  fs.writeFileSync(displayComponentPath, displayComponentContent.trim());
  console.log(`Created: ${displayComponentPath}`);

  // Create stripePaymentForm.jsx
  const formComponentPath = path.join(componentsDir, "stripePaymentForm.jsx");
  const formComponentContent = `
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
        className={\`w-full py-3 px-6 rounded-md text-white font-semibold transition \${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }\`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </form>
  );
};

export default StripePaymentForm;
  `;
  fs.writeFileSync(formComponentPath, formComponentContent.trim());
  console.log(`Created: ${formComponentPath}`);

  // Create stripePaymentIntent.jsx
  const intentComponentPath = path.join(componentsDir, "stripePaymentIntent.jsx");
  const intentComponentContent = `
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
        const response = await fetch('https://us-central1-stackgallery-fa1bb.cloudfunctions.net/createPaymentIntentWithCustomer', {
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

  `;
  fs.writeFileSync(intentComponentPath, intentComponentContent.trim());
  console.log(`Created: ${intentComponentPath}`);

  // Create stripeProvider.jsx in src folder
  const providerPath = path.join(srcDir, "stripeProvider.jsx");
  const providerContent = `
// src/StripeProvider.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OEhb3Ediyx2YMeqaDZ3I4ygNAKwD7OUiND0hGlHaT9aB3Otvvt7i6Qb2u0UvGCFpI9aLBMcyvxciL1ANLhneoIF008ci3UFkJ');

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;

  `;
  fs.writeFileSync(providerPath, providerContent.trim());
  console.log(`Created: ${providerPath}`);


  console.log("Stripe has been added!");
})();
