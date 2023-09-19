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
const HTTP_STATUS = require("../constants/statusCodes");
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
            cartItem = await cartModel.findById(userItem.cartId);
            //if prev cart is checked and user trying to add new cart then delete prev cart
            if (cartItem) {
                console.log("cartItem", cartItem);
    
                // Check if cart.checked is true
                if (cartItem.checked) {
                    // Delete the cart from cartModel
                    await cartModel.findByIdAndDelete(userItem.cartId);
                    
                    // Clear userItem.cartId
                    userItem.cartId = undefined;
                    await userItem.save();
    
                    // return res.status(200).send(success("Cart deleted as it is checked"));
                }}

            let flag = false;

            const bookItem = await bookModel.findById(BookId.id);

            if (!bookItem) {
                return res.status(404).send(failure(`Book with ID ${BookId.id} not found`));
            }

            if (bookItem.stock < BookId.quantity) {
                return res.status(400).send(failure(`Insufficient stock for book ${bookItem.title}`));
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
                const newCart = new cartModel({ userId: userItem._id, bookId: [BookId], total: total });
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
    async removeFromCart(req, res) {
        try {
            const { BookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const userItem = await userModel.findOne({ email: decodedToken.email });
            // console.log("decodedToken", decodedToken)
            // const userIdAsString = user._id.toString();
            // const result2 = await rateModel.findOne({ bookId, userId: userIdAsString });
            // const userItem = await userModel.findById(userId);
            if (!userItem) {
                return res.status(404).send(failure(`User with ID ${decodedToken._id} not found`));
            }
            const cartItem = await cartModel.findById(userItem.cartId);

            if (!cartItem) {
                return res.status(404).send(failure(`Cart for user not found`));
            }
    
            // Find the index of the book to be removed in the cart's bookId array
            const bookIndexToRemove = cartItem.bookId.findIndex((cartBook) =>
                cartBook.id.equals(BookId)
            );
            if (bookIndexToRemove === -1) {
                return res.status(404).send(failure(`Book with ID ${BookId} not found in the cart`));
            }
    const removedBook = cartItem.bookId[bookIndexToRemove];
            let amountToSubtract = 0;

            // Check if the removed book has a discount
            const bookItem = await bookModel.findById(removedBook.id);
    
            if (bookItem) {
                if (bookItem.discount) {
                    // Calculate the discounted price
                    amountToSubtract = bookItem.discountedPrice * removedBook.quantity;
                } else {
                    // Use regular price if no discount
                    amountToSubtract = bookItem.price * removedBook.quantity;
                }
            }
    
            // Subtract the amount from the cart's total
            cartItem.total -= amountToSubtract;
    
            // Remove the book from the cart's bookId array
            cartItem.bookId.splice(bookIndexToRemove, 1);

    
            // Save the updated cart
            await cartItem.save();
    
            return res.status(200).send(success("Book removed from the cart", { Cart: cartItem }));
        } catch (error) {
            console.error('Add cart error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createTransaction(req, res) {
        try {
            const { cartId } = req.body;
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
            // console.log("decodedToken", transactionItems)
            const user = await userModel.findOne({ email: decodedToken.email });


            if (!user) {
                return res.status(404).send(failure(`User with ID ${decodedToken._id} not found`));
            }

            // Check if the total is greater than or equal to user.balance
            if (total > user.balancedData) {
                return res.status(400).send(failure(`Empty balance. Please add balance`));
            }
            // Create a new transaction with the items
            const newTransaction = new transactionModel({
                userId: user._id,
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
                    user.transactionId = newTransaction._id;
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

    async showCart(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);

            console.log("decodedToken",decodedToken)
            if (!decodedToken.id.cartId) {
                return res.status(404).send(failure(`You don't have any cart`));
            }
            // Find the user's cart using the cartId from the decodedToken
            const userCart = await cartModel.findById(decodedToken.id.cartId);

            if (!userCart) {
                return res.status(404).send(failure(`Cart with ID ${decodedToken.cartId} not found`));
            }

            // Populate the userCart with book details (assuming you have a 'bookId' field in the cart model)
            await userCart.populate({
                path: 'bookId.id', // Specify the path to 'id' within 'bookId'
                select: 'title price',// Select only the 'id' field of the populated documents
            })
            const simplifiedCart = {
                bookId: userCart.bookId, // Include the populated 'bookId' field
                total: userCart.total, // Include the 'total' field
            };

            return res.status(200).send(success("Cart details", { Cart: simplifiedCart }));

        }
        catch (error) {
            console.error('Checkout error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async showTransaction(req, res) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({email:decodedToken.id.email});
            console.log("decodedToken",decodedToken)
            if (!user.transactionId) {
                return res.status(404).send(failure(`You don't have any transaction`));
            }
            // Find the user's cart using the cartId from the decodedToken
            const userTransaction = await transactionModel.findById(user.transactionId);

            if (!userTransaction) {
                return res.status(404).send(failure(`Cart with ID ${user.transactionId} not found`));
            }


            return res.status(200).send(success("Cart details", { Transaction: userTransaction }));

        }
        catch (error) {
            console.error('Checkout error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async showAllTransaction(req, res) {
        try {

                // Find all transactions in the transactionModel
                const transactions = await transactionModel.find()
                    .populate({
                        path: 'userId',
                        select: 'name' // Only populate the 'name' field from the 'userId' reference
                    })
                    .populate({
                        path: 'cartId',
                        select: 'total' // Only populate the 'total' field from the 'cartId' reference
                    });
        
                // Return the populated transactions
                return res.status(200).send(success("All transactions retrieved", { Transactions: transactions }));

        }
        catch (error) {
            console.error('Checkout error', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }



}

module.exports = new cartController();