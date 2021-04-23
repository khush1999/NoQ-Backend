const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    image: { 
        type: String,
    },
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
})


categorySchema.virtual('category_id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);