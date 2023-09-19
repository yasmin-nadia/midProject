const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user")
const authModel = require("../model/auth")
const bookModel = require("../model/book")
const reviewModel = require("../model/review")
const rateModel = require("../model/rate")
const cartModel = require("../model/cart")
const transactionModel = require("../model/transactions")
const discountModel = require("../model/discounts")
const mongoose = require('mongoose');
const express = require("express")
const app = express();
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken")
const moment = require('moment');

class discountController {
    async addDiscount(req, res) {
        try {
            const { bookId, discountId } = req.body;
    
            // Check if the book exists
            const book = await bookModel.findById(bookId);
    
            if (!book) {
                return res.status(404).send(failure(`Book with ID ${bookId} not found`));
            }
    
            // Check if the book already has a discount applied
            if (book.discount) {
                return res.status(400).send(failure(`Product already has a discount ongoing`));
            }
    
            // Check if the discount exists
            const discount = await discountModel.findById(discountId);
    
            if (!discount) {
                return res.status(404).send(failure(`Discount with ID ${discountId} not found`));
            }
    
            // Calculate the discounted price
            const discountedPrice = (1 - discount.percentage / 100) * book.price;
    
            // Update the book's discount and discountedPrice
            const currentDateTime = new Date();

            // Update the book's discount and set dateTime to current time
            book.discount =  discount._id,
            book.discountedPrice = discountedPrice;
    
            // Save the updated book
            await book.save();
    
            return res.status(200).send(success(`Discount applied successfully to book with ID ${bookId}`));
        } 
        catch (error) {
            console.error('Add Discount error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // async addDiscount(req, res) {
    //     try {
    //         const { bookId, discountId } = req.body;
    
    //         // Check if the book exists
    //         const book = await bookModel.findById(bookId);
    
    //         if (!book) {
    //             return res.status(404).send(failure(`Book with ID ${bookId} not found`));
    //         }
    
    //         // Check if the book already has a discount applied
    //         if (book.discount) {
    //             return res.status(400).send(failure(`Product already has a discount ongoing`));
    //         }
    
    //         // Check if the discount exists
    //         const discount = await discountModel.findById(discountId);
    
    //         if (!discount) {
    //             return res.status(404).send(failure(`Discount with ID ${discountId} not found`));
    //         }
    
    //         // Calculate the discounted price
    //         const discountedPrice = (1 - discount.percentage / 100) * book.price;
    
    //         // Update the book's discount and discountedPrice
    //         book.discount = discount._id;
    //         book.discountedPrice = discountedPrice;
    
    //         // Save the updated book
    //         await book.save();
    
    //         return res.status(200).send(success(`Discount applied successfully to book with ID ${bookId}`));
    //     } 
    //     catch (error) {
    //         console.error('Add Discount error', error);
    //         return res.status(500).json({ error: 'Internal server error' });
    //     }
    // }
}
module.exports = new discountController();