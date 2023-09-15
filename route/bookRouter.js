const express=require("express");
const routes=express();
const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
const userValidator = require('../middleware/userCreateValidation')


routes.post("/createuser", authenController.signUp);
routes.post("/login", userValidator.create, authenController.login)
routes.put("/updateuser",authenController.editUserInfo)
routes.use(authenController.notFound);
module.exports=routes;