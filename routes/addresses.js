const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Address } = require('../models/address');

router.get('/', async (req, res) =>{

    const addressList = await Address.find();

    if(!addressList) {
        res.status(500).json({success: false})
    } 
    
    res.status(200).send(addressList);
})

// Gets only id for all addresses
router.get('/:id', async(req,res)=>{
    console.log(req.params.id);
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        res.status(500).json({message: 'The category ID is not valid.'})
    }
    else{
        try {
        const address = await Address.findById(req.params.id);
        console.log("******************" + address);
        if(!address) {
            res.status(500).json({message: 'The category with the given ID was not found.'})
        } 
        res.status(200).send(address);        
        } 
        catch (error) {
        res.status(500).send("oops")    
        }
    } 
})

// POST API
router.post('/', async (req,res)=>{
    let address;
    try {
        address = new Address({
            street: req.body.street,
            building: req.body.building,
            pincode: req.body.pincode, // disabled this field in frontend
            city: req.body.city,
            state: req.body.state,
            user: req.body.user
        })
        console.log("************", address);
        address = await address.save();
    }
    catch(err) {
        res.status(400).json({msg: "Something went wrong, Pls fill all the fields!"})
    }
    
    res.send({data: address});
})

// Update user by id
router.put('/:id',async (req, res)=> {
    let addressExist;
    try {
        addressExist = await Address.findById(req.params.id);
        console.log(addressExist);
    } catch (err) {
        res.status(400).json({msg: "Invaid Address id!"})
    }
    Address.findByIdAndUpdate(req.params.id,
        {
            street: req.body.street,
            building: req.body.building,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state,
            user: addressExist.user
        },
        { new: true} // to reflect updated change
    ).then(address =>{
        if(address) {
            return res.status(200).json({success: true, message: 'The Address is updated!'})
        } else {
            return res.status(404).json({success: false , message: "Address not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

// Delete user by id
router.delete('/:id', (req, res)=>{
    Address.findByIdAndRemove(req.params.id).then(address =>{
        if(address) {
            return res.status(200).json({success: true, message: 'the address is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "address not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports = router;