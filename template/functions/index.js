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