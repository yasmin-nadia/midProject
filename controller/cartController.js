const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user")
const authModel = require("../model/auth")
const bookModel = require("../model/book")
const reviewModel = require("../model/review")
const rateModel = require("../model/rate")
const cartModel = require("../model/cart")
const mongoose = require('mongoose');
const express = require("express")
const app = express();
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken")
const moment = require('moment');

class cartController {
    async AddtoCart(req, res) {
        try {
            const { userId, BookId } = req.body;
            const userItem = await userModel.findById(userId);
            let cartItem;
            if (!userItem) {
                return res.status(404).send(failure(`User with ID ${userId} not found`));
            }

            console.log("userItem", userItem);
            let flag = false;

            const bookItem = await bookModel.findById(BookId.id);

            if (!bookItem) {
                return res.status(404).send(failure(`Book with ID ${BookId.id} not found`));
            }

            if (bookItem.stock < BookId.quantity) {
                return res.status(200).send(failure(`Insufficient stock for book ${bookItem.title}`));
            }

            cartItem = await cartModel.findById(userItem.cartId);
            if (cartItem) {
                console.log("cartItem", cartItem);
                flag = true;
                const existingBook = cartItem.bookId.find((cartBook) =>
                    cartBook.id.equals(bookItem._id)
                );
                if (existingBook) {
                    // Increase the quantity
                    console.log("if block is working");
                    existingBook.quantity += BookId.quantity;
                } else {
                    console.log("else block is working");
                    cartItem.bookId.push({
                        id: bookItem._id,
                        quantity: BookId.quantity,
                    });
                }
            }

            let total = 0; // Move the total initialization here

            if (flag) {
                // Calculate the total only if items are added to the cart
                for (const cartBook of cartItem.bookId) {
                    const book = await bookModel.findById(cartBook.id);
                    if (book) {
                        total += book.price * cartBook.quantity;
                    }
                }
            }


            if (!flag) {
                const newCart = new cartModel({ userId, BookId, total });
                await newCart
                    .save()
                    .then((data) => {
                        userItem.cartId = data._id;
                        userItem.save();
                        return res.status(200).send(success("One cart has been created", { Transaction: data }));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(500).send(failure("Failed to add the cart"));
                    });
            } else {
                cartItem.total = total; // Update the cart's total
                await cartItem
                    .save()
                    .then((data) => {
                        return res.status(200).send(success("Existing cart updated", { Transaction: data }));
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.status(500).send(failure("Failed to update the cart"));
                    });
            }
        } catch (error) {
            console.error('Add cart error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = new cartController();