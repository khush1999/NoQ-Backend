const authJwt = require("./helpers/jwt");
const cors = require('cors');
const errorHandler = require("./helpers/error-handler");
const express = require('express');
const morgan = require('morgan')
const mongoose = require("mongoose");
require('dotenv').config()

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

//Session Cookie
// app.use(cookieParser());
// app.use(session({
//     store: new RedisStore({
//         host: 'noq-redis-001.v9shsg.0001.use1.cache.amazonaws.com',
//         port: 6379
//     }), 
//     secret: process.env.SECRET,
//     resave: true,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         secure: false //turn to true on production once https is in place
//     }
// }));

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const fileuploadRoutes = require("./routes/fileupload");
const phoneAuthRoutes = require("./routes/phoneAuth");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/uploadfile`, fileuploadRoutes);
app.use(`${api}/auth`, phoneAuthRoutes);

//Health Check
app.get(`${api}/`, (req,res) => {
    res.send("Hello There!");
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

const host = 'localhost';
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
})