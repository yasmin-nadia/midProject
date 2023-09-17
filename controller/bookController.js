const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user")
const authModel = require("../model/auth")
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
            const existingBook = await authModel.findOne({ title: title });
            if (existingBook) {
                return res.status(200).send(success("This book already exists"));
            }
                const result = await bookModel.create({

                    title: title,
                    author: author,
                    price: price,
                    stock: stock,
                    genre:genre,
                    pages:pages,
                    category:category,
                    publisher:publisher,
                    description:description
    
                })
                if (result) {
                        return res.status(200).send(success("New book added", result));
                    }
                else {
                    return res.status(200).send(success("Could not add a new book"));
                }
            }
        
        catch(error){
            console.log("Book add error", error)
            return res.status(500).send(success("Internal server error"));
        }
    }
}
module.exports = new bookController();