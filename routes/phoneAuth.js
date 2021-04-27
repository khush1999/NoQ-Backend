require('dotenv/config')
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

// Health Check
router.get('/', (req, res)=>{
    res.status(200).send({
        message: "You are on Homepage",
        info: {
            login: "Send verification code through /login . It contains two params i.e. phonenumber and channel(sms/call)",
            verify: "Verify the recieved code through /verify . It contains two params i.e. phonenumber and code"
        }
    })
})

// Register Endpoint
// Params: - phone number
//     - channel (sms/call)

router.get('/sendOtp', (req,res) => {
     if (req.query.phonenumber) {
        client
        .verify
        .services(process.env.SERVICE_ID)
        .verifications
        .create({
            to: `+${req.query.phonenumber}`,
            channel: req.query.channel==='call' ? 'call' : 'sms' 
        })
        .then(data => {
            res.status(200).send({
                message: "Verification is sent!!",
                phonenumber: req.query.phonenumber,
                data
            })
        }) 
     } else {
        res.status(400).send({
            message: "Wrong phone number :(",
            phonenumber: req.query.phonenumber,
            data
        })
     }
})

// Verify Endpoint: 
// Params - phone number
//     - code

router.get('/verifyOtp', async (req, res) => {
    let phone = req.query.phonenumber
    const user = await User.findOne({phone: phone})

    if (req.query.phonenumber && (req.query.code).length === 4) {
        client
            .verify
            .services(process.env.SERVICE_ID)
            .verificationChecks
            .create({
                to: `+${req.query.phonenumber}`,
                code: req.query.code
            })
            .then(data => {
                if (data.status === "approved") {
                    let registered = true;
                    if(!user) {
                        registered = false;
                    }
                    console.log(data);
                    res.status(200).send({
                        isUser: registered,
                        isVerified: data.status,
                        phoneNumber: data.to
                    })
                }
            })
    } else {
        res.status(400).send({
            message: "Wrong phone number or code :(",
            phonenumber: req.query.phonenumber,
            data
        })
    }
})

module.exports = router;