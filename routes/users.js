const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let otp
   function generateOTP() 
   {
    // Declare a digits variable 
    // which stores all digits
    let digits = '0123456789';
    let OTP = '';
        for (let i = 0; i < 4; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
    return OTP;
    }

router.get('/', async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.get('/verifyotp', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

/*
Login Functionality-
    -If the mobile number exist in DB, go to Homepage
    - Else Go to SignUp Page
*/
router.post('/login', async (req,res) => {
    let ph =req.body.phone
    
    const user = await User.findOne({phone: ph})
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('You have not registered your mobile number with us. Please do sign in!!!');
    }
    else
    {
        return res.status(200).json({
        "success":true,
        "msg":"Go to Home Page"
        })
    }

  
})

/*Signup for the user -
  - Enter all the fields
  - Verify your phone number
  - Click on Register 
*/ 
router.post('/register', async (req,res)=>{
    //  const checkuser = await User.findOne({phone: ph})
    // const secret = process.env.secret;
    // if(checkuser) {
    //     return res.status(400).send('You have already registered your mobile number with us. Please do sign in!!!');
    // }
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

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