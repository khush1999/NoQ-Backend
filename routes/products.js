const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.get('/', async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
 
    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.get('/category/:category_id', async (req, res) => {
    const product = await Product.findById(req.params.category_id);
    console.log(product);
    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

router.post('/new', async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        count_in_stock: req.body.count_in_stock,
        rating: req.body.rating,
        num_reviews: req.body.num_reviews,
        isFeatured: req.body.isFeatured,
        product_SKU:req.body.product_SKU,
        discount_percentage:req.body.discount_percentage,
        bulk_discount_percentage:req.body.bulk_discount_percentage,
        max_qty:req.body.max_qty,
        created_at:req.body.created_at,
        updated_at:req.body.updated_at,
    });

    product = await product.save();

    if (!product) return res.status(500).send('The product cannot be created');

    res.send(product);
});

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        count_in_stock: req.body.count_in_stock,
        rating: req.body.rating,
        num_reviews: req.body.num_reviews,
        isFeatured: req.body.isFeatured,
        product_SKU:req.body.product_SKU,
        discount_percentage:req.body.discount_percentage,
        bulk_discount_percentage:req.body.bulk_discount_percentage,
        max_qty:req.body.max_qty,
        created_at:req.body.created_at,
        updated_at:req.body.updated_at,
    });

    product = await product.save();

    if (!product) return res.status(500).send('The product cannot be created');

    res.send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            count_in_stock: req.body.count_in_stock,
            rating: req.body.rating,
            num_reviews: req.body.num_reviews,
            isFeatured: req.body.isFeatured,
            product_SKU:req.body.product_SKU,
            discount_percentage:req.body.discount_percentage,
            bulk_discount_percentage:req.body.bulk_discount_percentage,
            max_qty:req.body.max_qty,
            created_at:req.body.created_at,
            updated_at:req.body.updated_at,
        },
        { new: true }
    );

    if (!updatedProduct) return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted!'
                });
            } else {
                return res.status(404).json({ success: false, message: 'product not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount
    });
});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

// API for getting Product by SKU for Barcode Scanning
router.get('/sku/get', async (req, res) => {

    let product;
    try {
        let product_sku = req.query.sku
        product = await Product.findOne({product_SKU: product_sku}).populate('category');
    } catch (error) {
        res.status(400).json({msg: "Invaid Product SKU"})
    }

    res.send(product);
});
// Good to have a gallery images API (Carousel)

module.exports = router;