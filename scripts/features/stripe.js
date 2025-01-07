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
