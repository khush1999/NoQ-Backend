const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    street: {
        type: String,
        default: ''
    },
    building: {
        type: String,
        default: ''
    },
    pincode :{
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})

addressSchema.virtual('address_id').get(function () {
    return this._id.toHexString();
});

addressSchema.set('toJSON', {
    virtuals: true,
});

exports.Address = mongoose.model('Address', addressSchema);
