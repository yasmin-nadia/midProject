const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bookValidator = (req, res, next) => {
    try {
        const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
        const message = [];

        if (!title) {
            message.push("Title is required");
        } else if (typeof title !== 'string') {
            message.push("Title must be a string");
        }
        else if (title.length > 20) {
            message.push("Title should not exceed 20 characters");
        }

        if (!author) {
            message.push("Author is required");
        } else if (typeof author !== 'string') {
            message.push("Author must be a string");
        } else {
            if (author.length > 20) {
                message.push("Author should not exceed 20 characters");
            } else if (!/^[A-Za-z\s]+$/.test(author)) {
                message.push("Author can only contain letters (A-Z and a-z) and spaces.");
            } else {
                const parts = author.split(' ');
                for (const part of parts) {
                    if (!/^[A-Z]/.test(part)) {
                        message.push("Each part of the Author must start with an uppercase letter.");
                        break; // Break out of the loop if any part is invalid
                    }
                    if (/[A-Z]/.test(part.slice(1))) {
                        message.push("Each part of the Author after the first character can't contain capital letters.");
                        break; // Break out of the loop if any part is invalid
                    }
                }
            }
        }

        if (!category) {
            message.push("Category is required");
        } else if (typeof category !== 'string') {
            message.push("Category must be a string");
        } else if (category.length > 20) {
            message.push("Category should not exceed 20 characters");
        }

        if (!publisher) {
            message.push("Publisher is required");
        } else if (typeof publisher !== 'string') {
            message.push("Publisher must be a string");
        } else if (publisher.length > 20) {
            message.push("Publisher should not exceed 20 characters");
        }
        if (!genre) {
            message.push("Genre is required");
        }

        else if (!Array.isArray(genre) || !genre.every(item => typeof item === 'string')) {
            message.push("Genre must be an array of strings");
        } else if (genre.some(item => item.length > 20)) {
            message.push("Each genre should not exceed 20 characters");
        }
        if (!price) {
            message.push("price is required");
        }
        else if (typeof price !== 'number' || isNaN(price) || price < 20 || price > 5000) {
            message.push("Price must be a number between 20 and 5000");
        }
        if (!stock) {
            message.push("stock is required");
        }

        if (typeof stock !== 'number' || !Number.isInteger(stock) || stock <= 0 || stock > 300) {
            message.push("Stock must be an integer between 1 and 300");
        }
        if (!pages) {
            message.push("pages is required");
        }

        if (typeof pages !== 'number' || !Number.isInteger(pages) || pages <= 0 || pages > 2000) {
            message.push("Pages must be an integer between 1 and 2000");
        }

        if (!description) {
            message.push("Description is required");
        } else if (typeof description !== 'string' || description.length > 200) {
            message.push("Description must be a string with a maximum length of 200 characters");
        }

        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }
    } catch (error) {
        console.log("Error while adding a new book", error);
        return res.status(500).send(failure("Internal server error"));
    }
}

module.exports = { bookValidator };
