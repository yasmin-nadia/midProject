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
}
module.exports = new bookController();