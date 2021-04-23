const express = require('express');
const morgan = require('morgan')
const mongoose = require("mongoose");

require('dotenv').config()

const api=process.env.API_URL

// Instantiate app
const app = express();

//middleware
app.use(express.json())
app.use(morgan('tiny'))

//Health Check
app.get(`${api}/`, (req,res) => {
    res.send("Hello There!");
})

//Sample Get a Product
app.get(`${api}/products`, (req,res) => {
    const product = {
            id:1,
            name:'soya bean',
            image:'some_url'
    }
    res.send(product);
})

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "qlessshopping",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

const host = 'localhost';
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
})