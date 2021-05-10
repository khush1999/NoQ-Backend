const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Address } = require('../models/address');
const { Invoice } = require('../models/invoice');

//GET INVOICE
router.get('/', async (req, res) =>{
    user_id = req.query.user_id;
    console.log("&&&&&&&&&&&&&&&&&", req.query.user_id);
    if(!mongoose.Types.ObjectId.isValid(req.query.user_id)){
        res.status(500).json({message: 'The user ID is not valid.'})
    }
    else{
        const invoice = await Invoice.find({user: user_id}).populate(["orders","user","transaction_id"]);
    //     .populate({
    //   path: "orderItems",
    //   populate: {
    //     path: "product",
    //   },
    // })
        console.log("******************" + invoice);
            if(!invoice) {
                res.status(500).json({message: 'The invoice with the given User ID was not found.'})
            } 
            res.status(200).send(invoice);
    }

})



module.exports = router;