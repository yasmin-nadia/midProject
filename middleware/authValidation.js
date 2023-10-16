const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const HTTP_STATUS = require("../constants/statusCodes");
const isAuthorised = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            console.log("Unauthorised access, login korenai")
            return res.status(200).send(success("Unauthorised access"))
        }
        const jwt = req.headers.authorization.split(" ")[1];
        const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
        if (validate) {
            // console.log("validate", validate)
            next();
        }
        else {
            return res.status(200).send(("User is not authorised"))
        }
    }
    catch (error) {
        console.log("token error", error)
        if (error instanceof jsonwebtoken.JsonWebTokenError) {
            return res.status(400).send(failure("Token Invalid"))
        }
        if (error instanceof jsonwebtoken.TokenExpiredError) {
            return res.status(400).send(failure("Token expired"))
        }
        const jwt = req.headers.authorization.split(" ")[1];
        // console.log("jwt", jwt)

        return res.status(200).send(success("Issue related to token"))

    }
}
const isAdmin = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
    if (decodedToken && decodedToken.role === "admin") {
        next();
    } else {
        return res.status(403).send(failure('Access denied. User is not an admin.'));
    }

};
const isUser = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
    if (decodedToken && decodedToken.role === "user" ){
        next();
    } else {
        return res.status(403).send(failure('Access denied to admin. You have to be a user.'));
    }

}

module.exports = { isAuthorised, isAdmin, isUser };