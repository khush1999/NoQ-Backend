const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    orders: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

exports.Invoice = mongoose.model('Invoice', invoiceSchema);

