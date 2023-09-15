const {body}=require("express-validator");
const { validationResult } = require("express-validator");

const validator={
    create:[
        body("email").
        exists().
        withMessage("Email must be given").
        bail().
        isString().
        withMessage("Eail must be in string format").
        isEmail().
        withMessage("Invalid email"),
        body("password").
        exists().
        withMessage("Password must be given").
        bail().
        isString().
        withMessage("Password must be string").
        bail().
        isStrongPassword({minLength:8, minLowercase:1, minUppercase:1, minNumbers:1,minSymbols:1}).
        withMessage("Password must contain at least 8 charecters with 1 lowercase, 1 uppercase, 1 number and 1 special charecter"),
        body("name")
        .exists()
        .withMessage("Name must be given")
        .bail()
        .isString()
        .withMessage("Name must be in string format")
       
    ]
}
// const errors = validationResult(req);
// if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
// }
module.exports=validator;