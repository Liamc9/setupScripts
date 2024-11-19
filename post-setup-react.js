// Import required modules
const fs = require('fs');
const path = require('path');
const { executeCommand } = require('./utils');

// Get the project path from the command-line arguments
const projectPath = process.argv[2];

// Check if project path is provided
if (!projectPath) {
  console.error("Please provide a path to the project directory.");
  process.exit(1);
}

// Resolve the functions directory path
const functionsDir = path.join(projectPath, 'functions');

// Ensure the functions directory exists
if (!fs.existsSync(functionsDir)) {
  console.error(`The functions directory does not exist at: ${functionsDir}`);
  process.exit(1);
}

// Define the .env file path
const envFilePath = path.join(functionsDir, '.env');

// Content for the .env file
const envContent = `# Environment variables
STRIPE_SECRET_KEY = 
`;

// Content for the index.js file in functions directory
const indexJsContent = `
const functions = require("firebase-functions/v1");
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const app = express();
const cors = require("cors")({origin: true}); // Enable CORS for all origins
app.use(cors);
const admin = require("firebase-admin");
admin.initializeApp();

// Payment Intent Function with Customer
// Creation/Attachment and Payment Method Attachment
exports.createPaymentIntentWithCustomer = functions
    .https.onRequest((req, res) => {
      cors(req, res, async () => {
        try {
          const {amount, email, createCustomer, attachPaymentMethod,
            currency, destinationAccount} = req.body;

          let customer;

          if (createCustomer && email) {
            // Check if the customer already exists
            const existingCustomers = await stripe.customers.list({
              email: email,
              limit: 1,
            });

            if (existingCustomers.data.length > 0) {
              customer = existingCustomers.data[0];
            } else {
              // Create a new customer if not existing
              customer = await stripe.customers.create({
                email: email,
              });
            }
          }

          // Create the payment intent
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: currency || "usd", // Use provided currency, default USD
            customer: customer ? customer.id : undefined, // Attach customer
            setup_future_usage: attachPaymentMethod ? "off_session" : undefined,
            transfer_data: destinationAccount ?
            {destination: destinationAccount} : undefined, // Dest account

          });

          res.status(200).send({clientSecret: paymentIntent.client_secret});
        } catch (error) {
          console.error("Error creating Stripe PaymentIntent:", error);
          res.status(500).send({error: error.message});
        }
      });
    });
`;

// Create the .env file with initial content
fs.writeFile(envFilePath, envContent, (err) => {
  if (err) {
    console.error("Error creating the .env file:", err);
    process.exit(1);
  }
  console.log(`.env file has been created at ${envFilePath}`);
  
  // Write index.js content
  const indexFilePath = path.join(functionsDir, 'index.js');
  fs.writeFile(indexFilePath, indexJsContent, (err) => {
    if (err) {
      console.error("Error writing to index.js file:", err);
      process.exit(1);
    }
    console.log("index.js file has been updated.");

    // Run npm install commands in the project directory
    console.log("\nInstalling packages in the project directory...");
    executeCommand(`npm install react-firebase-hooks`, { cwd: projectPath });
    executeCommand(`npm install stripe`, { cwd: projectPath });
    executeCommand(`npm install dotenv`, { cwd: projectPath });
    executeCommand(`npm install cors`, { cwd: projectPath });
    
    // Run npm install commands in the functions directory
    console.log("\nInstalling packages in the functions directory...");
    executeCommand(`npm install stripe`, { cwd: functionsDir });
    executeCommand(`npm install dotenv`, { cwd: functionsDir });
    executeCommand(`npm install cors`, { cwd: functionsDir });

    // Run features/stripe.js after installations
    console.log("\nRunning features/stripe.js...");
    executeCommand(`node features/stripe.js ${projectPath}`);
    
    console.log("Setup complete.");
  });
});
