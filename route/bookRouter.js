const express=require("express");
const routes=express();
// const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const bookController = require("../controller/bookController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
// const {validator}  = require('../middleware/userCreateValidation');
const {userValidator,userUpdateValidator,userLoginValidator}  = require('../middleware/userValidation');
const urlnotfound=require("../constants/urlnotfound");
const bookController = require("../controller/bookController");
// USER
routes.post("/createuser", userValidator,authenController.signUp);
routes.post("/login", userLoginValidator, authenController.login)
routes.put("/updateuser",isAuthorised,isAdmin,userUpdateValidator,authenController.editUserInfo)
routes.put("/updateselfuser",isAuthorised,userUpdateValidator,authenController.editSelfInfo)
routes.delete("/deleteuser",isAuthorised,isAdmin,userUpdateValidator,authenController.deleteUser)
routes.get("/getuser",isAuthorised,isAdmin,authenController.getUsers)
//BOOK
routes.get("/addbook",isAuthorised,isAdmin,bookController.addBook)
//URL NOT FOUND
routes.use(urlnotfound.notFound);
module.exports=routes;