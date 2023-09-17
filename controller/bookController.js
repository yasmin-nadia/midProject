const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user")
const authModel = require("../model/auth")
const bookModel = require("../model/book")
const express = require("express")
const app = express();
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken")
const moment = require('moment');

class bookController {
    async addBook(req, res) {
        try {
            const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
            const existingBook = await bookModel.findOne({ title: title });
            if (existingBook) {
                return res.status(200).send(success("This book already exists"));
            }
            const result = await bookModel.create({

                title: title,
                author: author,
                price: price,
                stock: stock,
                genre: genre,
                pages: pages,
                category: category,
                publisher: publisher,
                description: description

            })
            if (result) {
                return res.status(200).send(success("New book added", result));
            }
            else {
                return res.status(200).send(success("Could not add a new book"));
            }
        }

        catch (error) {
            console.log("Book add error", error)
            return res.status(500).send(success("Internal server error"));
        }
    }
    async updateBook(req, res) {
        try {
            const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
            const existingBook = await bookModel.findOne({ title: title });
            if (!existingBook) {
                return res.status(200).send(success("This book does not exist"));
            }
            const updatedFields = {};

            // Check if each field is provided and update it if necessary
            if (title) {
                updatedFields.title = title;
            }
            if (author) {
                updatedFields.author = author;
            }
            if (price) {
                updatedFields.price = price;
            }
            if (stock) {
                updatedFields.stock = stock;
            }
            if (genre) {
                updatedFields.genre = genre;
            }
            if (pages) {
                updatedFields.pages = pages;
            }
            if (category) {
                updatedFields.category = category;
            }
            if (publisher) {
                updatedFields.publisher = publisher;
            }
            if (description) {
                updatedFields.description = description;
            }

            // Update the book document with the provided fields
            const updatedBook = await bookModel.findOneAndUpdate(
                { title: title },
                { $set: updatedFields },
                { new: true } // To return the updated book document
            );

            return res.status(200).send(success("Book information updated", updatedBook));
        }

        catch (error) {
            console.log("Book update error", error)
            return res.status(500).send(success("Internal server error"));
        }
    }
    async deleteBook(req, res) {
        try {
            const { title } = req.body;
            const book = await bookModel.findOne({ title: title });

            if (!book) {
                return res.status(200).send(success(`${title} does not exist`));
            } else {
                const existingBook = await bookModel.deleteOne({ title: title });
                return res.status(200).send(success(`${book.title} is deleted successfully`));
            }
        }
        catch (error) {
            console.log("Book update error", error)
            return res.status(500).send(success("Internal server error"));
        }
    }
    async getBook(req, res) {
        try {
            // object destructuring
            let { page, limit, searchParam, price, order,pages, priceFlow, sortField, category, stockFlow, pagesFlow,stock, priceUpperBound, priceLowerBound, rate, rateFlow } = req.query;

            console.log("{page,limit}", page, limit);

            // Create a query object
            const query = {};
            if (!(page)) {
                page = 1
            }
            if (!(limit)) {
                limit = 5
            }

            // creates regular expression
            if (searchParam) {
                const regex = new RegExp(searchParam, 'i'); // 'i' flag for case-insensitive search
                query.$or = [{ category: regex }, { author: regex }, { publisher: regex }, { title: regex }, { description: regex }]; //or operation
            }

            if (stock && (stockFlow === 'upper' || stockFlow === 'lower')) {

                const stockFilter = stockFlow === 'upper' ? { $gte: parseFloat(stock) } : { $lte: parseFloat(stock) };
                query.stock = stockFilter;
            }
            else if (stock) {
                const stockFilter = { $eq: parseFloat(stock) }
                query.stock = stockFilter;
            }
            if (price && (priceFlow === 'upper' || priceFlow === 'lower')) {

                if (priceFlow === 'upper') {
                    query.price = { $gte: parseFloat(price) };
                } else {
                    query.price = { $lte: parseFloat(price) };
                }


            }
            else if (price) {
                query.price = {
                    $eq: parseFloat(price)
                };
            } else if (priceUpperBound && priceLowerBound) {
                if (isNaN(parseFloat(priceLowerBound)) || isNaN(parseFloat(priceUpperBound))) {
                    return res.status(200).send(success("Both bounds must be valid numbers."));
                }
                if (parseFloat(priceLowerBound) > parseFloat(priceUpperBound)) {
                    return res.status(200).send(success("Invalid price range"));
                }
                query.price = {
                    $gte: parseFloat(priceLowerBound),
                    $lte: parseFloat(priceUpperBound),
                };
            }

            if (rate && (rateFlow === 'upper' || rateFlow === 'lower')) {

                if (rateFlow === 'upper') {
                    query.rate = { $gte: parseFloat(rate) };
                } else {
                    query.rate = { $lte: parseFloat(price) };
                }


            }
            else if (rate) {
                query.rate = {
                    $eq: parseFloat(rate)
                };
            }
            if (pages && (pagesFlow === 'upper' || pagesFlow === 'lower')) {

                if (pagesFlow === 'upper') {
                    query.pages = { $gte: parseFloat(pages) };
                } else {
                    query.pages = { $lte: parseFloat(pages) };
                }


            }
            else if (pages) {
                query.pages = {
                    $eq: parseFloat(pages)
                };
            }

            // pagination
            const options = {
                skip: (page - 1) * limit,
                limit: parseInt(limit),
            };
            if (sortField && !(order)) {
                options.sort = { [sortField]: 1 }; // Ascending order by default
            }

            // Sort based on any field in ascending or descending order
            if (order) {
                if (order === 'asc') {
                    options.sort = { [sortField]: 1 }; // Ascending order
                } else if (order === 'desc') {
                    options.sort = { [sortField]: -1 }; // Descending order
                } else {
                    return res.status(200).send(success("priceOrder parameter is invalid"));
                }
            }

            if (category && Array.isArray(category)) {
                query.category = { $in: category };
            } else if (category) {
                query.category = category;
            }


            // Find documents that match the query
            const mangas = await mangasModel.find(query, null, options).populate({
                path: 'review',
                select: '-_id reviewText user', // Include the user field from the review
                populate: {
                    path: 'user', // Specify the path to populate
                    select: '-_id name', // Select the username field from the user
                },
            });


            if (mangas.length > 0) {
                console.log(mangas);
                return res.status(200).send(success("Successfully received", mangas));
            }
            if (mangas.length == 0) {
                return res.status(200).send(success("No mangas were found"));
            }
        }
        catch (error) {
            console.log("Get book error", error)
            return res.status(500).send(success("Internal server error"));
        }
    }
}
module.exports = new bookController();