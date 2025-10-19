const mongoose = require('mongoose');

const claimItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    claimBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status:{
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    dateReported: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ClaimItem', claimItemSchema);
