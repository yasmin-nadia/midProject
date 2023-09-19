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
            const { BookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const userItem = await userModel.findOne({ email: decodedToken.email });
            // console.log("decodedToken", decodedToken)
            // const userIdAsString = user._id.toString();
            // const result2 = await rateModel.findOne({ bookId, userId: userIdAsString });
            // const userItem = await userModel.findById(userId);
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
                        // Check if the book has a discount
                        if (book.discount) {
                            // Calculate the discounted price
                            total += book.discountedPrice * cartBook.quantity;
                        } else {
                            // Use regular price if no discount
                            total += book.price * cartBook.quantity;
                        }
                    }
                }
            }


            if (!flag) {
                if (bookItem.discount) {
                    // Calculate the discounted price
                    total += bookItem.discountedPrice * BookId.quantity;
                } else {
                    // Use regular price if no discount
                    total += bookItem.price * BookId.quantity;
                }
                console.log("total:", total, " (Type:", typeof total, ")");

                // const newCart = new cartModel({ userId, BookId, total });
                const newCart = new cartModel({ userId:userItem._id, bookId: [BookId], total: total });
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
    async createTransaction(req, res) {
        try {
            const { userId, cartId } = req.body;
            const userCart = await cartModel.findById(cartId);
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
           

            if (!userCart) {
                return res.status(404).send(failure(`Cart with ID ${cartId} not found`));
            }
            else {
                if ((userCart.checked)) {
                    return res.status(200).send(failure(`You order is on the way`));
                }
            }
            const transactionItems = [];

            // Iterate through each item in the cart
            for (const cartBook of userCart.bookId) {
                const bookId = cartBook.id;
                const quantity = cartBook.quantity;

                // Find the book by its ID
                const bookItem = await bookModel.findById(bookId);

                if (!bookItem) {
                    return res.status(404).send(failure(`Book with ID ${bookId} not found`));
                }

                if (bookItem.stock < quantity) {
                    return res.status(400).send(failure(`Insufficient stock for book ${bookItem.title}`));
                }
                if (bookItem.discount) {
                    // Calculate the price using the discounted price
                    const price = bookItem.discountedPrice;
                    transactionItems.push({ bookId, quantity, price });
                } else {
                    // Use regular price if no discount
                    const price = bookItem.price;
                    transactionItems.push({ bookId, quantity, price });
                }

                // Reduce the stock of the book
                bookItem.stock -= quantity;
                await bookItem.save();

            }
            const total = transactionItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            console.log("transactionItems", transactionItems)
            const user = await userModel.findOne({ email: decodedToken.email });


            if (!user) {
                return res.status(404).send(failure(`User with ID ${userId} not found`));
            }

            // Check if the total is greater than or equal to user.balance
            if (total > user.balancedData) {
                return res.status(400).send(failure(`Empty balance. Please add balance`));
            }
            // Create a new transaction with the items
            const newTransaction = new transactionModel({
                userId: decodedToken._id,
                cartId: userCart._id,
                total: total
            });

            userCart.bookId = [];
            userCart.total = 0;
            userCart.checked = true;
            // await newTransaction.populate("userId cartId.id");
            await userCart.save();
            await newTransaction.save()
                .then((data) => {
                    user.balancedData -= total; // Subtract the transaction total from the user's balance
                    user.save();
                    return res.status(200).send(success("One transaction has been created", { Transaction: data }));
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).send(failure("Failed to add the transaction"));
                });
        }
        catch (error) {
            console.error('Checkout error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = new cartController();