const express=require("express");
const routes=express();
// const {validationResult}=require("express-validator");

const authenController = require("../controller/authController");
const {isAuthorised,isAdmin,isUser}=require("../middleware/authValidation");
// const {validator}  = require('../middleware/userCreateValidation');
const {userValidator,userUpdateValidator,userLoginValidator,balancedDataValidator}  = require('../middleware/userValidation');
const {bookValidator,bookUpdateValidator,getBookValidator}  = require('../middleware/bookValidation');
const {reviewValidator,reviewDeleteValidator,rateValidator,rateDeleteValidator}  = require('../middleware/reviewValidation');
const {cartValidator,checkoutValidator,cartRemoveValidator}  = require('../middleware/cartValidation');
const {discountUpdateValidator}=require('../middleware/discountValidator');
const urlnotfound=require("../constants/urlnotfound");
const bookController = require("../controller/bookController");
const cartController = require("../controller/cartController");
const discountController = require("../controller/discountController");
// USER
routes.post("/createuser", userValidator,authenController.signUp);
routes.post("/login", userLoginValidator, authenController.login)
routes.put("/updateuser",isAuthorised,isAdmin,userUpdateValidator,authenController.editUserInfo)
routes.put("/updateselfuser",isAuthorised,isUser,userUpdateValidator,authenController.editSelfInfo)
routes.delete("/deleteuser",isAuthorised,isAdmin,userUpdateValidator,authenController.deleteUser)
routes.get("/getuser",isAuthorised,isAdmin,authenController.getUsers)
routes.put("/addbalance",isAuthorised,isUser,balancedDataValidator,authenController.addBalance)
routes.get("/showcart",isAuthorised,isUser,cartController.showCart)
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
//ADD TO CART AND CHECKOUT
routes.post("/addtocart",isAuthorised,isUser,cartValidator,cartController.AddtoCart)
routes.delete("/removefromcart",isAuthorised,isUser,cartRemoveValidator,cartController.removeFromCart)
routes.post("/checkout",isAuthorised,isUser,checkoutValidator,cartController.createTransaction)
routes.get("/showcart",isAuthorised,isUser,cartController.showCart)
routes.get("/showtransaction",isAuthorised,isUser,cartController.showTransaction)
routes.get("/showalltransaction",isAuthorised,isAdmin,cartController.showAllTransaction)
routes.delete("/cancelorder",cartController.cancelOrder)
//ADD TO DISCOUNT
routes.post("/adddiscount",isAuthorised,isAdmin,discountController.addDiscount)
routes.put("/updatediscount",isAuthorised,isAdmin,discountUpdateValidator,discountController.updateDiscount)
//URL NOT FOUND
routes.use(urlnotfound.notFound);
module.exports=routes;