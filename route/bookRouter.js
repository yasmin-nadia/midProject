const express=require("express");
const routes=express();

const authenController = require("../controller/authController");
routes.post("/createuser", authenController.signUp);
module.exports=routes;