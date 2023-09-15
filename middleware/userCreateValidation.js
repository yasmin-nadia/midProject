const {body}=require("express-validator");
const {validationResult}=require("express-validator");
const validator={
    create:[
        body("email").
        isString().
        withMessage("Email must be in string format").
        isEmail().
        withMessage("Invalid email"),
        body("password").
        isString().
        withMessage("Password must be string").
        bail().
        isStrongPassword({minLength:8, minLowercase:1, minUppercase:1, minNumbers:1,minSymbols:1}).
        withMessage("Password must contain at least 8 charecters with 1 lowercase, 1 uppercase, 1 number and 1 special charecter"),
        body("name")
        .isString()
        .withMessage("Name must be in string format"),
        body("address")
        .isString()
        .withMessage("Address must be in string format"),
        body("role")
        .isString()
        .withMessage("Role must be in string format")
 ]
}
// const errors = validationResult(req);
// if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
// }

module.exports = validator;