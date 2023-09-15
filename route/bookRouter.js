const express=require("express");
const routes=express();
// const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
const {validator}  = require('../middleware/userCreateValidation');
const urlnotfound=require("../constants/urlnotfound");
// console.log("validator.create",validator.create)
routes.post("/createuser", authenController.signUp);
routes.post("/login", validator.create, authenController.login)
routes.put("/updateuser",isAuthorised,authenController.editUserInfo)
routes.use(urlnotfound.notFound);
module.exports=routes;