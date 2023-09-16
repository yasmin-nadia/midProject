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
            
        }
        catch(error){
            console.log("Book add error", error)
            return res.status(500).send(success("Could not add a new book"));
        }
    }
}
module.exports = new bookController();