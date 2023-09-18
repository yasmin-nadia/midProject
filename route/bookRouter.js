const express=require("express");
const routes=express();
// const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
// const {validator}  = require('../middleware/userCreateValidation');
const {userValidator,userUpdateValidator,userLoginValidator,balancedDataValidator}  = require('../middleware/userValidation');
const {bookValidator,bookUpdateValidator,getBookValidator}  = require('../middleware/bookValidation');
const {reviewValidator,reviewDeleteValidator,rateValidator,rateDeleteValidator}  = require('../middleware/reviewValidation');
const urlnotfound=require("../constants/urlnotfound");
const bookController = require("../controller/bookController");
// USER
routes.post("/createuser", userValidator,authenController.signUp);
routes.post("/login", userLoginValidator, authenController.login)
routes.put("/updateuser",isAuthorised,isAdmin,userUpdateValidator,authenController.editUserInfo)
routes.put("/updateselfuser",isAuthorised,isUser,userUpdateValidator,authenController.editSelfInfo)
routes.delete("/deleteuser",isAuthorised,isAdmin,userUpdateValidator,authenController.deleteUser)
routes.get("/getuser",isAuthorised,isAdmin,authenController.getUsers)
routes.put("/addbalance",isAuthorised,isUser,balancedDataValidator,authenController.addBalance)
//BOOK
routes.post("/addbook",isAuthorised,isAdmin,bookValidator,bookController.addBook)
routes.put("/updatebook",isAuthorised,isAdmin,bookUpdateValidator,bookController.updateBook)
routes.delete("/deletebook",isAuthorised,isAdmin,bookUpdateValidator,bookController.deleteBook)
routes.get("/getbook",bookUpdateValidator,getBookValidator,bookController.getBook)
routes.post("/addreview",isAuthorised,isUser,reviewValidator,bookController.addReview)
routes.put("/updatereview",isAuthorised,isUser,reviewValidator,bookController.updateReview)
routes.delete("/deletereview",isAuthorised,isUser,reviewDeleteValidator,bookController.deleteReview)
routes.post("/addrate",isAuthorised,isUser,rateValidator,bookController.addRate)
routes.put("/updaterate",isAuthorised,isUser,rateValidator,bookController.updateRate)
routes.delete("/deleterate",isAuthorised,isUser,rateDeleteValidator,bookController.deleteRate)
//URL NOT FOUND
routes.use(urlnotfound.notFound);
module.exports=routes;