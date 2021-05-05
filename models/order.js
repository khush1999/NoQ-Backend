const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required:true
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.virtual('order_id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);



/**
Order Example:

{
    "orderItems" : [
        {
            "quantity": 3,
            "product" : "608bc58d329944532819dbca"
        },
        {
            "quantity": 2,
            "product" : "608bc58d329944532819dbcb"
        }
    ],
    "address": "608fe0f1550da43ef055f338",
    "phone": "+420702241333",
    "user": "608bd2b57c6d3d3084946f21"
}

 */