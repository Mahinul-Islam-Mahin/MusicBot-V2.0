const express = require('express');
const bodyParser = require('body-parser');
// const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your Stripe secret key

const app = express();
app.use(bodyParser.json());

// Example database to store premium users (replace with a real database)
const premiumUsers = new Map();

app.post('/webhook', async (req, res) => {
  // Temporarily disable Stripe webhook handling
  // const sig = req.headers['stripe-signature'];
  // const endpointSecret = 'YOUR_STRIPE_ENDPOINT_SECRET'; // Replace with your Stripe endpoint secret

  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  // } catch (err) {
  //   console.error('Webhook signature verification failed:', err.message);
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }

  // Handle the event
  // switch (event.type) {
  //   case 'checkout.session.completed':
  //     const session = event.data.object;
  //     const userId = session.metadata.userId; // Retrieve user ID from metadata
  //     premiumUsers.set(userId, true); // Mark the user as premium
  //     console.log(`User ${userId} has purchased premium.`);
  //     break;
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }

  res.status(200).send('Webhook temporarily disabled');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Payment webhook listening on port ${PORT}`);
});

module.exports = premiumUsers;
