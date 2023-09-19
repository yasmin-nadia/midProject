const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const HTTP_STATUS = require("../constants/statusCodes");
const userValidator = (req, res, next) => {
    try {
        const { email, name, password, address, phone, role, key } = req.body;
        const message = [];



        if (!(email)) {
            message.push("Please provide an Email");
        }
        else {
            if (typeof email !== 'string') {
                message.push("Email must be a string");
            }
            else {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (!emailRegex.test(email)) {
                    message.push("Invalid email format");
                }
            }

        }
        if (!(name)) {
            message.push("Please provide a name");
        }
        else {
            if (typeof name !== 'string') {
                message.push("Name must be a string");
            } else {
                if (name.length > 20) {
                    message.push("Name should not exceed 20 characters");
                }
                else {
                    if (!/^[A-Za-z\s]+$/.test(name)) {
                        message.push("Name can only contain letters (A-Z and a-z) and spaces.");
                    }
                    else {
                        const parts = name.split(' ');
                        for (const part of parts) {
                            if (!/^[A-Z]/.test(part)) {
                                message.push("Each part of the name must start with an uppercase letter.");
                                break; // Break out of the loop if any part is invalid
                            }
                            if (/[A-Z]/.test(part.slice(1))) {
                                message.push("Each part of the name after the first character can't contain capital letters.");
                                break; // Break out of the loop if any part is invalid
                            }
                        }
                    }
                }

            }
        }
        if (!(password)) {
            message.push("Please provide a password");
        }
        else {
            if (typeof password !== 'string') {
                message.push("Password must be a string");
            } else {
                if (password.length < 8) {
                    message.push("Password must be at least 8 characters long");
                }

                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(password)) {
                    message.push("Password should contain at least one uppercase, one lowercase, one number, and one special character");
                }
            }

        }
        if (address) {
            const areaNames = [
                "Dhaka", "Badda", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur",
                "Dhanmondi", "Lalmatia", "Motijheel", "Shyamoli", "Farmgate", "Tejgaon",
                "Karwan Bazar", "Jatrabari", "Kamrangirchar", "Puran Dhaka", "Baridhara",
                "Niketon", "Basundhara", "Khilgaon"
            ];

            if (typeof address !== 'object') {
                message.push("Address must be an object");
            } else {
                if (!address.hasOwnProperty('area')) {
                    message.push("Address must have an 'area' property");
                } else if (typeof address.area !== 'string') {
                    message.push("'area' must be a string");
                } else if (!areaNames.includes(address.area)) {
                    message.push("Delivery is not available in your area");
                }

                if (!address.hasOwnProperty('streetAddress')) {
                    message.push("Address must have a 'streetAddress' property");
                } else if (typeof address.streetAddress !== 'string') {
                    message.push("'streetAddress' must be a string");
                }
            }
        }
        if (!(phone)) {

            message.push("Please provide a phone number");


        }
        else {
            if (typeof phone !== 'string') {
                message.push("Phone must be a string");
            } else {
                const phoneNumberRegex = /^(013|014|015|016|017|018|019)\d{8}$/;

                if (!phoneNumberRegex.test(phone)) {
                    message.push("Invalid phone number");
                }
            }

        }
        if (role) {
            const validRoles = ["admin", "user"]
            if (typeof role !== 'string') {
                message.push("Role must be a string");
            }
            else if (!validRoles.includes(role)) {
                message.push("Invalid role");
            }
            else if (role === "admin") {
                if (!(key)) {
                    message.push("You must provide 'key' for unlocking admin role");
                }

                else if (typeof key !== 'string') {
                    message.push("Key must be a string");
                }

                else if (key !== "x@z") {
                    message.push("Invalid 'key' provided");
                }




            }

        }

        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }
    }
    catch (error) {
        console.log("Error while validating", error)
        return res.status(500).send(failure("Internal server error"));
    }

};
const userUpdateValidator = (req, res, next) => {
    try {
        const { email, name, password, address, phone, role } = req.body;
        const message = [];
        if (name) {
            if (typeof name !== 'string') {
                message.push("Name must be a string");
            } else {
                if (name.length > 20) {
                    message.push("Name should not exceed 20 characters");
                }
                else {
                    if (!/^[A-Za-z\s]+$/.test(name)) {
                        message.push("Name can only contain letters (A-Z and a-z) and spaces.");
                    }
                    else {
                        const parts = name.split(' ');
                        for (const part of parts) {
                            if (!/^[A-Z]/.test(part)) {
                                message.push("Each part of the name must start with an uppercase letter.");
                                break; // Break out of the loop if any part is invalid
                            }
                            if (/[A-Z]/.test(part.slice(1))) {
                                message.push("Each part of the name after the first character can't contain capital letters.");
                                break; // Break out of the loop if any part is invalid
                            }
                        }
                    }
                }

            }
        }
        if (address) {
            const areaNames = [
                "Dhaka", "Badda", "Gulshan", "Banani", "Mirpur", "Uttara", "Mohammadpur",
                "Dhanmondi", "Lalmatia", "Motijheel", "Shyamoli", "Farmgate", "Tejgaon",
                "Karwan Bazar", "Jatrabari", "Kamrangirchar", "Puran Dhaka", "Baridhara",
                "Niketon", "Basundhara", "Khilgaon"
            ];

            if (typeof address !== 'object') {
                message.push("Address must be an object");
            } else {
                if (!address.hasOwnProperty('area')) {
                    message.push("Address must have an 'area' property");
                } else if (typeof address.area !== 'string') {
                    message.push("'area' must be a string");
                } else if (!areaNames.includes(address.area)) {
                    message.push("Delivery is not available in your area");
                }

                if (!address.hasOwnProperty('streetAddress')) {
                    message.push("Address must have a 'streetAddress' property");
                } else if (typeof address.streetAddress !== 'string') {
                    message.push("'streetAddress' must be a string");
                }
            }
        }
        if (phone) {

            if (typeof phone !== 'string') {
                message.push("Phone must be a string");
            } else {
                const phoneNumberRegex = /^(013|014|015|016|017|018|019)\d{8}$/;

                if (!phoneNumberRegex.test(phone)) {
                    message.push("Invalid phone number");
                }
            }

        }
        if (role) {

            if (typeof role !== 'string') {
                message.push("Role must be a string");
            } else {
                const validRoles = ["user", "admin"]

                if (!validRoles.includes(role)) {
                    message.push("Invalid role");
                }
            }

        }
        if (!(email)) {
            message.push("Please provide an Email");

        } else {

            if (typeof email !== 'string') {
                message.push("Email must be a string");
            }
            else {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (!emailRegex.test(email)) {
                    message.push("Invalid email format");
                }
            }

        }
        if (password) {
            if (typeof password !== 'string') {
                message.push("Password must be a string");
            } else {
                if (password.length < 8) {
                    message.push("Password must be at least 8 characters long");
                }

                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(password)) {
                    message.push("Password should contain at least one uppercase, one lowercase, one number, and one special character");
                }
            }

        }
        if (role) {
            const validRoles = ["admin", "user"]
            if (typeof role !== 'string') {
                message.push("Role must be a string");
            }
            else if (!validRoles.includes(role)) {
                message.push("Invalid role");
            }


        }

        if (message.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).send(failure(message.join(", ")));
        } else {
            next();
        }
    }
    catch (error) {
        console.log("Error while user update validating", error)
        return res.status(500).send(failure("Internal server error"));
    }


}
const userLoginValidator = (req, res, next) => {
    try {
        const message = []
        const { email, password, role } = req.body;
        if (!(email)) {
            message.push("Please provide an Email");
        }
        else {
            if (typeof email !== 'string') {
                message.push("Email must be a string");
            }
            else {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (!emailRegex.test(email)) {
                    message.push("Invalid email format");
                }
            }

        }
        if (!(password)) {
            message.push("Please provide a password");
        }
        else {
            if (typeof password !== 'string') {
                message.push("Password must be a string");
            } else {
                if (password.length < 8) {
                    message.push("Password must be at least 8 characters long");
                }

                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(password)) {
                    message.push("Password should contain at least one uppercase, one lowercase, one number, and one special character");
                }
            }

        }
        if (role) {
            const validRoles = ["admin", "user"]
            if (typeof role !== 'string') {
                message.push("Role must be a string");
            }
            else if (!validRoles.includes(role)) {
                message.push("Invalid role");
            }


        }
        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }

    }
    catch (error) {
        console.log("Error while user login validating", error)
        return res.status(500).send(failure("Internal server error"));
    }
}
const balancedDataValidator = (req, res, next) => {
    try {
        const { balancedData } = req.body;

        // Check if balancedData is not a number or not within the specified range
        if (typeof balancedData !== 'number' || balancedData < 100 || balancedData > 30000) {
            return res.status(400).send(failure("Invalid balancedData. It must be a number between 100 and 30000."));
        }

        // If validation passes, continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error while validating balancedData", error);
        return res.status(500).send(failure("Internal server error"));
    }
};





module.exports = { userValidator, userUpdateValidator, userLoginValidator, balancedDataValidator };
