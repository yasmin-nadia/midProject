const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const HTTP_STATUS = require("../constants/statusCodes");
const reviewValidator = (req, res, next) => {
    try {
        const { reviewText} = req.body;
        const {bookId}=req.query;
        const message=[]

        if (typeof reviewText !== 'string' || reviewText.length <5|| reviewText.length > 200) {
            message.push("Review text must be a string between 5 and 200 characters.");
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            message.push("Invalid bookId.");
        }
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    } catch (error) {
        // Handle any other errors
        console.error('Review validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
const reviewDeleteValidator = (req, res, next) => {
    try {
        const { bookId } = req.query
        const message=[]
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            message.push("Invalid bookId.");
        }
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    } catch (error) {
        // Handle any other errors
        console.error('Review delete validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
const rateValidator = (req, res, next) => {
    try {
        const { rate } = req.body;
        const {bookId}=req.query;
        const message = [];

        // Check if rate is a number and within the range of 1 to 5
        if (typeof rate !== 'number' || rate < 1 || rate > 5) {
            message.push("Rate must be a number between 1 and 5.");
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            message.push("Invalid bookId.");
        }
        
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    }catch (error) {
        // Handle any other errors
        console.error('Review validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
const rateDeleteValidator = (req, res, next) => {
    try {
        const { bookId } = req.query
        const message=[]
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            message.push("Invalid bookId.");
        }
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    } catch (error) {
        // Handle any other errors
        console.error('Review delete validation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

module.exports = { reviewValidator,reviewDeleteValidator,rateValidator ,rateDeleteValidator};
