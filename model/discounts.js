const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
    discountType: {
        type: String,
        required: true
    },
    
    percentage:{
        type: Number,
        required: true
    },
    startDate: {
        type: Date,

    },
    endDate: {
        type: Date,

    },
    valid:{
        type: Boolean,
    }
}, { timestamps: true });

const discountModel = mongoose.model("discounts", discountSchema);

module.exports = discountModel;
