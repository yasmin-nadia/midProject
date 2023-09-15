const { body } = require("express-validator");

const validator={
    create:[
  body("email")
    .exists()
    .withMessage("Email must be provided")
    .isString()
    .withMessage("Email must be a string")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .exists()
    .withMessage("Password must be provided")
    .isString()
    .withMessage("Password must be a string")
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage("Password must contain at least 8 characters with 1 lowercase, 1 uppercase, 1 number, and 1 special character"),
  body("name")
    .exists()
    .withMessage("Name must be provided")
    .isString()
    .withMessage("Name must be a string"),
  body("address")
    .optional() // Make address optional
    .isString()
    .withMessage("Address must be a string"),
  body("role")
    .optional() // Make role optional
    .isString()
    .withMessage("Role must be a string"),
]};

module.exports = {validator} ;
