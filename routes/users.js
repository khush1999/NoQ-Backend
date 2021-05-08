const {User} = require('../models/user');
const {Address} = require('../models/address');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*Signup for the user -
  - If user's phone isn't in the database, then enter the details 
  - Click on Register 
*/
router.post('/register', async (req,res)=>{
let phoneNo=`+91${req.body.phone}` 
let user, address;
try {
    user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: phoneNo, // disabled this field in frontend
        isAdmin: req.body.isAdmin
    })
    user = await user.save();

    if(req.body.street != "" && req.body.building != "" && req.body.pincode != "" && req.body.city != "" && req.body.state != "") {
        address = new Address({
            street: req.body.street,
            building: req.body.building,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state,
            user: user._id
        })
        address = await address.save();
    }
    
    console.log("&&&&&&", address);
    req.session.phone = phoneNo;
    req.session.user_id = user._id;
    console.log(req.session + "********************");
    req.session.save();
}
catch(err) {
    res.status(400).json({msg: "Something went wrong, Pls fill all the fields!"})
}

res.send({data: user, msg: "Success"});
})

// Get all users
router.get('/', async (req, res) =>{
     let userList
    try {
    userList = await User.find();
       
    } catch (error) {
        
    }
 
    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

// Find user by id
router.get('/:id', async (req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

// Update user by id
router.put('/:id',async (req, res)=> {
    let userExist;
    try {
        userExist = await User.findById(req.params.id);
        console.log(userExist);
    } catch (err) {
        res.status(400).json({msg: "Invaid User id"})
    }
    User.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: userExist.phone,
            isAdmin: userExist.isAdmin
        },
        { new: true} // to reflect updated change
    ).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'The User is updated!'})
        } else {
            return res.status(404).json({success: false , message: "User not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

// Delete user by id
router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

// Get user count for analytics purpose
router.get('/get/count', async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})



module.exports =router;