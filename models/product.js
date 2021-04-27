const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '',
        required: true,
    },
    brand: {
        type: String,
        default: '',
        required: true,

    },
    price : {
        type: Number,
        default:0,
        required: true,

    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    count_in_stock: {
        type: Number,
        required: true,
        min: 0,
        max: 50
    },
    rating: {
        type: Number,
        default: 0,
    },
    num_reviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    product_SKU:{
        type:String,
        default:'',
        required: true,
    },
    discount_percentage:{
        type:Number,
        default:0,
        min:0,
        max:25,
        required: true,
    },
    bulk_discount_percentage:{
        type:Number,
        default:0,
        min:0,
        max:75,
        required: true,
    },
    max_qty:{
        type:Number,
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true,

    },
})

productSchema.virtual('product_id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);