const express = require('express');
const morgan = require('morgan')
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


const host = 'localhost';
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
})