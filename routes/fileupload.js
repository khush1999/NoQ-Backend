const {Category} = require('../models/category');

const express = require('express');
const router = express.Router();
const path = require('path');

// For excel sheet upload
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const api = process.env.API_URL;

//For AWS S3 Bucket
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const filename='image.png'
let s3path;
let MongoClient = require('mongodb').MongoClient;
let url = process.env.CONNECTION_STRING
let msg=[]

const csv=require('csvtojson')
let reqPath = path.join(__dirname, '../');

global.__basedir = __dirname;

// -> Multer Upload Storage
const FILE_TYPE_MAP = {
    'text/csv': 'csv',
  };
  
  var storage = multer.diskStorage({
  
    destination: function(req, file, cb) {
              
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
const uploadImg = multer({ dest: reqPath+'/public/' })
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

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve())
          .on('error', e => reject(e));
      }),
  );

// const uploadImageToS3 = () => {
//   fs.readFile(fileName, (err, data) => {
//      if (err) throw err;
//      const params = {
//          Bucket: 'hbs-noq', // pass your bucket name
//          Key: 'image.png', // file will be saved as testBucket/contacts.csv
//          Body: JSON.stringify(data, null, 2)
//      };
//      s3.upload(params, function(s3Err, data) {
//          if (s3Err) throw s3Err
//          console.log(`File uploaded successfully at ${data.Location}`)
//      });
//   });
// };  
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
            "name": {"type": "string"},
            "description": {"type": "string"},
            "image": {"type": "string"}, // "http://localhost:3000/public/upload/image-2323232"
            "brand": {"type": "string"},
            "price": {"type": "string"},
            "category": {"type": "string"},
            "count_in_stock": {"type": "string"},
            "rating": {"type": "string"},
            "num_reviews": {"type": "string"},
            "isFeatured": {"type": "string"},
            "product_SKU":{"type": "string"},
            "discount_percentage":{"type": "string"},
            "bulk_discount_percentage":{"type": "string"},
            "max_qty":{"type": "string"},
          }
        };
        jsonObj.map(async (obj)=>{
          // const category = await Category.findById(req.body.category);
          if(!Validator(obj, schema,{ allowUnknownAttributes: false }
            ).valid){
            msg.push("Schema Not Valid")
          }
  
          if(obj.name == ''){
            msg.push(`Row ${obj.name} has name field missing`)
            console.log(`Row ${obj.name} has name field missing`); 
          }
 
          if(obj.description == ''){
            msg.push("Description is missing")
            console.log("Description is missing"); 
          }   
          console.log(validURL(obj.image));
          if(!validURL(obj.image)){
            msg.push(`Row ${obj.name} has image field missing/invalid URL`)
            console.log(`Row ${obj.name} has address field missing`);          
          }

          
          if(obj.brand == ''){
            msg.push("Brand field is missing")
            console.log("Brand field is missing"); 
          }   

          if(obj.price == ''){
            msg.push(`Row ${obj.price} has price field missing`)
            console.log(`Row ${obj.price} has price field missing`); 
          }   
          if(obj.category == ''){
            msg.push(`Row ${obj.category} has category field missing`)
            console.log(`Row ${obj.category} has category field missing`); 
          }   
          if(!Category.findById(obj.category)){
            msg.push("Category ID NOT FOUND")
            console.log("Category ID NOT FOUND"); 
          }   
          if(obj.count_in_stock == ''){
            msg.push(`Row ${obj.count_in_stock} has count_in_stock field missing`)
            console.log(`Row ${obj.count_in_stock} has count_in_stock field missing`); 
          }   
          if(obj.rating == ''){
            msg.push("rating missing")
            console.log("rating missing"); 
          }   
          if(obj.num_reviews == ''){
            msg.push(`Row ${obj.num_reviews} has num_reviews field missing`)
            console.log(`Row ${obj.num_reviews} has num_reviews field missing`); 
          }   
          if(obj.isFeatured == ''){
            msg.push("isFeatured ID NOT FOUND")
            console.log("isFeatured ID NOT FOUND"); 
          }   
          if(obj.product_SKU == ''){
            msg.push(`Row ${obj.product_SKU} has product_SKU field missing`)
            console.log(`Row ${obj.product_SKU} has product_SKU field missing`); 
          }   
          if(obj.discount_percentage == ''){
            msg.push(`Row ${obj.discount_percentage} has discount_percentage field missing`)
            console.log(`Row ${obj.discount_percentage} has discount_percentage field missing`); 
          }   
          if(obj.bulk_discount_percentage == ''){
            msg.push(`Row ${obj.bulk_discount_percentage} has bulk_discount_percentage field missing`)
            console.log(`Row ${obj.bulk_discount_percentage} has bulk_discount_percentage field missing`); 
          }   
          if(obj.max_qty == ''){
            msg.push(`Row ${obj.max_qty} has max_qty field missing`)
            console.log(`Row ${obj.max_qty} has max_qty field missing`); 
          }   
          let example_image_1 = await download_image(obj.image, 'image.png');           

          console.log("++++++++++++++++++++++++"+example_image_1); 

          uploadImageToS3()
          // (async ()=>{
          // let example_image_1 = await download_image(obj.image, 'image.png');           

          // console.log("++++++++++++++++++++++++"+example_image_1); 

          // uploadImageToS3()

          // })

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