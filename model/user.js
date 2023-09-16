const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({


    email: {

        type: String,
        required: [true, 'email must be given']
    },
    name: {
        type: String,
        required: [true, 'name must be given']
    },
    phone: {
        type: String,
        required: [true, 'phone must be given']
    },
    address: {
        area: {
            type: String,
            required: [true, 'Area must be given'],
        },
        streetAddress: {
            type: String,
            required: [true, 'Street address must be given'],
        },
    },
    cartId: {
        type: mongoose.Types.ObjectId,
        ref: "carts",
    },
    userblocked:{
        type:Boolean,
        default:false
    }
})
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;