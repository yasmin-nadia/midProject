const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const HTTP_STATUS = require("../constants/statusCodes");
const discountUpdateValidator = (req, res, next) => {
    try {
        const { discountType ,startDate,endDate,percentage,valid} = req.body;
        const message = [];
        function isValidDate(dateString) {
            // Check if the date string is a valid date
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        }
        if (!discountType) {
            message.push("Must provide discount type.");
        }

        if (startDate && !isValidDate(startDate)) {
            message.push("Start date is not valid.");
        }

        if (endDate && !isValidDate(endDate)) {
            message.push("End date is not valid.");
        }

        if (percentage !== undefined && (percentage < 10 || percentage > 90)) {
            message.push("Percentage should be between 10 and 90.");
        }

        if (valid !== undefined && typeof valid !== "boolean") {
            message.push("Valid should be a boolean value.");
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

module.exports = { discountUpdateValidator };