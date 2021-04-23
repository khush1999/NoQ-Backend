const cors = require('cors');
const express = require('express');
const morgan = require('morgan')
const mongoose = require("mongoose");
require('dotenv').config()

// Instantiate app
const app = express();

global.__basedir = __dirname;

//middleware
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use("/public/files", express.static(__dirname + "/public/files"));

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);

//Health Check
app.get(`${api}/`, (req,res) => {
    res.send("Hello There!");
})

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshopdemo",
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