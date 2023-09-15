const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const express = require("express")
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
class urlnotfound{
    async notFound(req, res) {
        return res.status(404).send(success({ message: "URL Not found" }));
    }
}
module.exports = new urlnotfound();