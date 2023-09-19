const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const HTTP_STATUS = require("../constants/statusCodes");
const cartValidator = (req, res, next) => {
    try {
        const { BookId } = req.body;
        const message = [];
        if (typeof BookId !== 'object') {
            message.push("BookId must be an object.");
        }
        else {
            if (!BookId.id) {
                message.push("BookId.id is required.");
            }
           else if (!mongoose.Types.ObjectId.isValid(BookId.id)) {
                message.push("Invalid bookId.");
            }
    
            // Check if BookId.quantity is missing
            if (!(BookId.quantity)) {
                message.push("BookId.quantity is required.");
            }
            // Check if rate is a number and within the range of 1 to 5
            else if(typeof BookId.quantity !== 'number' || BookId.quantity < 1 || BookId.quantity > 50) {
                message.push("Quantity must be a number between 1 and 50.");
            }

            
        }

        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    }
    catch (error) {
        // Handle any other errors
        console.error('Cart validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
const cartRemoveValidator = (req, res, next) => {
    try {
        const { BookId } = req.body;
        const message = [];
        if (!mongoose.Types.ObjectId.isValid(BookId)) {
            message.push("Invalid bookId");
        }
        
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    }
    catch (error) {
        // Handle any other errors
        console.error('Cart validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

const checkoutValidator = (req, res, next) => {
    try {
        const { cartId } = req.body;
        const message = [];
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            message.push("BookId must be an object.");
        }
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    }
    catch (error) {
        // Handle any other errors
        console.error('Checkout validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
module.exports = { cartValidator,checkoutValidator,cartRemoveValidator };