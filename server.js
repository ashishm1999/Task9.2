const cors = require('cors');
const express = require('express');
const { uuid } = require('uuidv4');
const app = express();
app.use(express.json());
app.use(cors());
const bodyParser = require('body-parser')
const stripe = require('stripe')('sk_test_51LkmbtFYRyYCUYhqUXGe1x3kjBJ6QK9kfKE4caL6K1jKemoR8vWGWAfXtnhh4EP6gYijtnBP51p904GR3dMM9Uzg00Ap0MrpDk');
const port = process.env.PORT || 8080;
app.use(bodyParser.json())


app.get("/",(req,res) => {
  res.send("PAYMENT");
});


app.post('/checkout', async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { product, token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "AUD",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchased the ${product.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "success";
  }

  res.json({ error, status });
});



// app.post('/pay', async (req, res) => {
//     const {email} = req.body;
    
//     const paymentIntent = await stripe.paymentIntents.create({
//         amount: 9.99,
//         currency: 'aud',
//         metadata: {integration_check: 'accept_a_payment'},
//         receipt_email: email,
//       });

//       res.json({'client_secret': paymentIntent['client_secret']})
// })

// app.post('/sub', async (req, res) => {
//   const {email, payment_method} = req.body;

//   const customer = await stripe.customers.create({
//     payment_method: payment_method,
//     email: email,
//     invoice_settings: {
//       default_payment_method: payment_method,
//     },
//   });
//   const subscription = await stripe.subscriptions.create({
//     customer: customer.id,
//     items: [{ plan: 'price_1LdshcGH599OltwtxCe0i5fj' }],
//     expand: ['latest_invoice.payment_intent']
//   });

//   const status = subscription['latest_invoice']['payment_intent']['status'] 
//   const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']

//   res.json({'client_secret': client_secret, 'status': status});
// })


require('dotenv').config()

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)



const sendEmail = async (msg) => {
    console.log("1");
    try{
      await sgMail.send(msg).then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      });
      console.log(msg)
      console.log("Email sent");
    } catch(error){
      console.log(msg)
      console.log(error);

      if (error.response){
        console.log(error.response.body);
      }

    }


};
console.log("82");
app.post('/welcome', async (req, res) => {
    console.log("2");
  const {email} = req.body;

  sendEmail({
    to: email,
    from: "manchandaa45@gmail.com",
    Subject: "NodeJs says hello",
    Text: "Welcome to Dev @ Deakin!"
  });
  console.log("3");

  res.send('Thank you for signing up! A welcome email has been sent');

})
console.log("98");

app.listen(port, () => console.log(`Dev @ Deakin listening on port ${port}!`));
