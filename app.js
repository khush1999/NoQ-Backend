const express = require('express');
require('dotenv').config()

// Instantiate app
const app = express();

app.get('/', (req,res) => {
    res.send("Hello There!");
})

const host = 'localhost';
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}`);
})