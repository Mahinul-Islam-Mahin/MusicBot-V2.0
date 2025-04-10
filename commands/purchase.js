// const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your Stripe secret key

// module.exports = {
//   name: 'purchase',
//   description: 'Purchase premium access',
//   async execute(message) {
//     try {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: [
//           {
//             price_data: {
//               currency: 'usd',
//               product_data: {
//                 name: 'Premium Access',
//               },
//               unit_amount: 500, // $5.00
//             },
//             quantity: 1,
//           },
//         ],
//         mode: 'payment',
//         success_url: 'http://localhost:3000/success', // Replace with your success URL
//         cancel_url: 'http://localhost:3000/cancel', // Replace with your cancel URL
//         metadata: {
//           userId: message.author.id, // Pass user ID as metadata
//         },
//       });

//       message.channel.send(
//         `Click the link to purchase premium: ${session.url}`
//       );
//     } catch (error) {
//       console.error('Error creating checkout session:', error);
//       message.channel.send(
//         'An error occurred while creating the checkout session.'
//       );
//     }
//   },
// };
