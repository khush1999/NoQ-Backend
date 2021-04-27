const express = require('express');
const router = express.Router();
const path = require('path');

// For excel sheet upload
const fs = require('fs');
const multer = require('multer');
const api = process.env.API_URL;

let MongoClient = require('mongodb').MongoClient;
let url = process.env.CONNECTION_STRING
let msg=[]

const csv=require('csvtojson')
 
global.__basedir = __dirname;

// -> Multer Upload Storage
const FILE_TYPE_MAP = {
    'text/csv': 'csv',
  };
  
  var storage = multer.diskStorage({
  
    destination: function(req, file, cb) {
              let reqPath = path.join(__dirname, '../');
// const filetype=req.file
//     if (!filetype) {
//       return res.status(500).send("Please upload an excel file!");
//     }
console.log(file);

        if (file.mimetype == "text/csv") {
            cb(null, reqPath+'/public/files/');
        }
        else {
            return cb(new Error('Invalid csv type'));
        }
      // const isValid = FILE_TYPE_MAP[file.mimetype];
      // let uploadError = new Error('invalid csv type');

      // console.log(uploadError);
      // console.log("***********************");
      // if (isValid) {
      //     uploadError = null;
      // }
      //   cb(uploadError, reqPath+'/public/files/');
    },
    filename: function(req, file, cb) {
      const fileName = file.originalname.split('.').join('-');
          const extension = FILE_TYPE_MAP[file.mimetype];
          cb(null, `${fileName}-${Date.now()}.${extension}`); 
    },
  });

  var upload = multer({storage: storage});

  const uploadoptions=upload.single("file")
// -> Express Upload RestAPIs
router.post(`/`, (req, res) =>{
  
    uploadoptions(req, res, function (err) {

        if (err) {
            return res.status(400).send({ message: err.message })
        }

        // Everything went fine.
        //   //307 is for temp forward request 
    //   /*307 Temporary Redirect (since HTTP/1.1) In this occasion, the request should be repeated with another URI, but future requests can still use the original URI.2 In contrast to 303, the request method should not be changed when reissuing the original request. For instance, a POST request must be repeated using another POST request. */
    const fil=req.file
    if(!fil){
      return res.status(500).send("Please upload an excel file!");
    } 
    else{
          res.redirect(307,`uploadDB/?DB=`+req.file.filename)
    }   
        // const file = req.file;
        // res.status(200).send({
        //     filename: file.filename,
        //     mimetype: file.mimetype,
        //     originalname: file.originalname,
        //     size: file.size,
        //     fieldname: file.fieldname
        // })
    })
    // const file=req.file
    // if (!file) {
    //   return res.status(500).send("Please upload an excel file!");
    // }
    // else{
    //   //307 is for temp forward request 
    //   /*307 Temporary Redirect (since HTTP/1.1) In this occasion, the request should be repeated with another URI, but future requests can still use the original URI.2 In contrast to 303, the request method should not be changed when reissuing the original request. For instance, a POST request must be repeated using another POST request. */
    //   res.redirect(307,`uploadDB/?DB=`+req.file.filename)
    // }  
});

// -> Import CSV File to MongoDB database
function importCsvData2MongoDB(filePath)
{
    try {
      csv()
      .fromFile(filePath)
      .then((jsonObj)=>{
        var Validator = require('jsonschema').validate;
        var schema = {
          "id": "abc",
          "type": "object",
          "properties": 
          {
            "sample_id": {"type": "string"},
            "name": {"type": "string"},
            "address": {"type": "string"},
          }
        };
        jsonObj.map((obj)=>{

          if(!Validator(obj, schema,{ allowUnknownAttributes: false }
            ).valid){
            msg.push("Schema Not Valid")
          }

          if(obj.sample_id == ''){
            msg.push("Sample ID missing")
            console.log("Sample ID missing"); 
          }   
          if(obj.name == ''){
            msg.push(`Row ${obj.sample_id} has name field missing`)
            console.log(`Row ${obj.sample_id} has name field missing`); 
          }   
          if(obj.address == ''){
            msg.push(`Row ${obj.sample_id} has address field missing`)
            console.log(`Row ${obj.sample_id} has address field missing`);          
          }   
            
        })

        if(msg!=''){
          console.log("if reached"+msg);
         }
        else{
          // Insert Json-Object to MongoDB
          MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true }, (err, db) => {
          if (err) throw err;
          let dbo = db.db("Qless");
          dbo.collection("products").remove({})
          dbo.collection("products").insertMany(jsonObj, (err, res) => {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
              /**
                 Number of documents inserted: 5
              */
              db.close();
          });
          });
          msg.push("Success")
        }
          
          
    
          fs.unlinkSync(filePath);
      })      
    } catch (error) {
      console.log(error);
    }

}

router.post(`/uploadDB/`, upload.single("file"), async (req, res) =>{
  let reqPath = path.join(__dirname, '../');
  await importCsvData2MongoDB(reqPath + '/public/files/' + req.query.DB);  
   setTimeout(() => {
    if(msg.includes('Success')){
      res.json({
        'msg': 'File uploaded/import successfully!', 'file': req.file 
      });    
    }
    else{
      res.json(msg)
    }
    msg=[]
}, 1000);
  
});

module.exports =router;