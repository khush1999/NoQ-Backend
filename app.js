const authJwt = require("./helpers/jwt");
const cors = require('cors');
const errorHandler = require("./helpers/error-handler");
const express = require('express');
const morgan = require('morgan')
const mongoose = require("mongoose");
require('dotenv').config()
const fs = require('fs');

const session = require('express-session')
const cookieParser = require('cookie-parser')

const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

// Instantiate app
const app = express();

global.__basedir = __dirname;

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }));
//middleware
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('tiny'));
// app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use("/public/files", express.static(__dirname + "/public/files"));

app.use(cookieParser())
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:process.env.secret,
  cookie:{maxAge:3600000*24}
}))

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const addressRoutes = require("./routes/addresses");
const ordersRoutes = require("./routes/orders");
const fileuploadRoutes = require("./routes/fileupload");
const phoneAuthRoutes = require("./routes/phoneAuth");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/address`, addressRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/uploadfile`, fileuploadRoutes);
app.use(`${api}/auth`, phoneAuthRoutes);

// isLoggedIn Check
app.get(`${api}/`, (req,res) => {
  isLoggedIn = req.session; 
  if(isLoggedIn.phone) {
    res.status(200).send({"data":isLoggedIn.phone});
  } 
  else 
  {
    res.status(200).send({"data":'nothing'});
  }
})

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Qless",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

const host = '0.0.0.0';
const port = process.env.PORT || 5000;
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
})