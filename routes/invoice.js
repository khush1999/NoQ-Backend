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
        Invoice.find({user: user_id})
        .populate({
            path: "orders", // populate blogs
            populate: {
         path: "orderItems", // in blogs, populate comments
         populate:{
             path:"product"
         }
      }
   })
   .then(product => {
    // console.log(product[0].orders.orderItems[0]);
    console.log(product);
    res.status(200).json(product); 
   }).catch((error)=>{
       res.status(500).json({message: 'The invoice with the given User ID was not found.'})
   });
        
    }

})



module.exports = router;