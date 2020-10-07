require("dotenv").config();
const cors = require("cors");
const express = require("express");
const stripe = require("stripe")(process.env.REACT_APP_SEC);
const uuid = require("uuid");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("It works at LearnCodeOnline");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body; //here we have done the destructuring
  console.log("PRODUCT", product);
  console.log("PRICE", product.price);
  const idempotencyKey = uuid();
  //this key is only fired at once
  //this keeps the track that the user is not charged twice for the same product
  //*********************************************** */
  //here down we r creating our customer
  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address.country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

//listening
app.listen(8282, () => console.log("Listening at port 8282"));
