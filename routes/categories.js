const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
const bodyparser=require('body-parser');
const bodyParser = require('body-parser');
router.use(bodyparser.json())
router.use(express.json())
router.use(bodyParser.urlencoded({extended: true}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let reqPath = path.join(__dirname, '../');

         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, reqPath+'public/uploads/category');
        }
        else {
            return cb(new Error('Invalid img type'));
        }
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split('.').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const upload = multer({ storage: storage });

const uploadOptions=upload.fields([{name: 'icon', maxCount: 1}, 
{name: 'image', maxCount: 1}])

//Get all categories 
router.get('/', async (req, res) =>{

    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    
    res.status(200).send(categoryList);
});

router.post('/', async (req,res)=>{
    // let prods1= await Category.find().populate("products")
    // let listOfprods=[]
    // prods1.map((p)=>{
    //     p.get('product').map((a)=>{
    //         listOfprods.push(a)
    //     })
    //     console.log(listOfprods);
    //     console.log("*************");
    // })   
    // listOfprods.push(req.body.prod_id)
        // console.log(req.body.name);
        // if(!req.files.icon || !req.files.image) return res.status(400).send('No image in the request');
        // if(!req.body.name) return res.status(400).send('No name in the request');
        // const file1 = req.files.icon[0];
        // const file2 = req.files.image[0];
        // if (!file1 || !file2) return res.status(400).send('No image in the request');

        const categoryList = await Category.find({'name':req.body.name});
        console.log(categoryList);
        if(categoryList.length == 0){

        uploadOptions(req, res, async function (err) {

        if (err) {
            return res.status(400).send({ message: err.message })
        }

        // Everything went fine.
        //   //307 is for temp forward request 
    //   /*307 Temporary Redirect (since HTTP/1.1) In this occasion, the request should be repeated with another URI, but future requests can still use the original URI.2 In contrast to 303, the request method should not be changed when reissuing the original request. For instance, a POST request must be repeated using another POST request. */

        if(!req.files.icon || !req.files.image) return res.status(400).send('No image in the request');
        if(!req.body.name) return res.status(400).send('No name in the request');
        const file1 = req.files.icon[0];
        const file2 = req.files.image[0];
        if (!file1) return res.status(400).send('Icon is missing!!!');
        if (!file2) return res.status(400).send('Image is missing!!!');
            const fileName1 = file1.filename;
        const fileName2 = file2.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/category/`;
        console.log(req.body.name);
        let category = new Category({
            name: req.body.name,
            icon: `${basePath}${fileName1}`,
            image: `${basePath}${fileName2}`,
            // product: listOfprods,
        })

        category = await category.save();
        console.log(category);
        if(!category)
        return res.status(400).send('the category cannot be created!')

        res.send(category);
        // const fil=req.file
        // if(!fil){
        //   return res.status(500).send("Please upload an excel file!");
        // } 
        // else{
        //       res.redirect(307,`uploadDB/?DB=`+req.file.filename)
        // }   
            // const file = req.file;
            // res.status(200).send({
            //     filename: file.filename,
            //     mimetype: file.mimetype,
            //     originalname: file.originalname,
            //     size: file.size,
            //     fieldname: file.fieldname
            // })
    })
}
else if(!req.body.name) {
    return res.status(400).send('Category name cannot be blank!!');
}
else{
    return res.status(400).send('Category with the similar name already exists!!!! Please use a different name')
}

})


// Gets only id for all categories
router.get('/:id', async(req,res)=>{
    console.log(req.params.id);
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        res.status(500).json({message: 'The category ID is not valid.'})
    }
    else{
    console.log("******************");
    try {
    const category = await Category.findById(req.params.id);
    console.log("******************"+category);
    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);        
    } 
    catch (error) {
    res.status(500).send("oops")    
    }

    } 

})

// Gets product for a specific category id
router.get('/category/:id', async(req,res)=>{
    
    const category = await Category.findById(req.params.id).populate('product');

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
})

router.put("/update/:id", async function(req, res) {
    await uploadOptions(req, res, async function (err) {
                console.log(req.body.name);

        if (err) {
            return res.status(400).send({ message: err.message })
        }

        // Everything went fine.
        //   //307 is for temp forward request 
    //   /*307 Temporary Redirect (since HTTP/1.1) In this occasion, the request should be repeated with another URI, but future requests can still use the original URI.2 In contrast to 303, the request method should not be changed when reissuing the original request. For instance, a POST request must be repeated using another POST request. */

        if(!req.files.icon || !req.files.image) return res.status(400).send('No image in the request');
        if(!req.body.name) return res.status(400).send('No name in the request');
        const file1 = req.files.icon[0];
        const file2 = req.files.image[0];
        if (!file1) return res.status(400).send('Icon is missing!!!');
        if (!file2) return res.status(400).send('Image is missing!!!');
            const fileName1 = file1.filename;
        const fileName2 = file2.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/category/`;
        console.log(fileName1);
        const category = await Category.findByIdAndUpdate(
        {_id: req.params.id},
        {$set:{
            name: req.body.name,
            icon: `${basePath}${fileName1}`,
            image: `${basePath}${fileName2}`,
        }},
        { new: true}
    )

    if(!category)
    {return res.status(400).send('the category cannot be updated!')}
    else{
res.status(200).json({
    "data":req.body.name
});
    }
        // let category = new Category({
        //     name: req.body.name,
        //     icon: `${basePath}${fileName1}`,
        //     image: `${basePath}${fileName2}`,
        //     // product: listOfprods,
        // })

        // category = await category.save();
        // console.log(category);
        // if(!category)
        // return res.status(400).send('the category cannot be created!')

        // res.send(category);
        // const fil=req.file
        // if(!fil){
        //   return res.status(500).send("Please upload an excel file!");
        // } 
        // else{
        //       res.redirect(307,`uploadDB/?DB=`+req.file.filename)
        // }   
            // const file = req.file;
            // res.status(200).send({
            //     filename: file.filename,
            //     mimetype: file.mimetype,
            //     originalname: file.originalname,
            //     size: file.size,
            //     fieldname: file.fieldname
            // })
    })
//     console.log(req.body);
//   Category.updateOne({ _id: req.params.id }, { name: req.body.name,
//             icon: req.body.icon,
//             image: req.body.image, }, function(
//     err,
//     result
//   ) {
//     if (err) {
//       res.send(err);
//     } else {
//       res.send(result);
//     }
//   });
});

// let bp = require('body-parser').urlencoded({ extended: true }); 
// router.put('/:id',async (req, res,next)=> {
//     console.log(next);
//     const category = await Category.findByIdAndUpdate(
//         {_id: req.params.id},
//         {$set:{
//             name: req.body.name,
//             icon: req.body.icon,
//             image: req.body.image,
//         }},
//         { new: true}
//     )

//     if(!category)
//     {return res.status(400).send('the category cannot be updated!')}
//     else{
// res.send(category);
//     }

    
// })
router.put('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            image: req.body.image,
        },
        { new: true}
    )

    if(!category)
    return res.status(400).send('the category cannot be updated!')

    res.send(category);
})

router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;