const express=require("express");
const routes=express();
const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
const validator = require('../middleware/userCreateValidation')


routes.post("/createuser", authenController.signUp);
routes.post("/login", validator.create, authenController.login)
module.exports=routes;