const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    
   
    userId: {
        type: mongoose.Types.ObjectId,
        ref:"users",
        required:true
        },
    bookId:{type:[{
        id:{
            type:mongoose.Types.ObjectId,
            ref:"books",
            required:true
        },
        quantity: Number,
       

    },],},
    
   total:{
    type:Number
   },
   checked:{
    type:Boolean,
    default: false
   },
   
},{timestamps:true})
const cartModel = mongoose.model("carts", cartSchema);

module.exports = cartModel;