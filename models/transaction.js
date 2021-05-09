const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    orders: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    payment_id: {
        type: String,
        required: true,
    },
    transactionDate: {
        type: Date,
        default: Date.now,
    },
})

exports.Transaction = mongoose.model('Transaction', transactionSchema);

