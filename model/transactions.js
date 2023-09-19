const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required:true
    },
    cartId:
    {
        type: mongoose.Types.ObjectId,
        ref: "carts",
        required:true
    },
    total: {
        type: Number,
        default: 0
    },
    discountedTotal: {
        type: Number,
        default: 0
    },
    created:{
        type: Date,
    
    }

},
    { timestamps: true })

const transactionModel = mongoose.model("transactions", transactionsSchema);

module.exports = transactionModel;