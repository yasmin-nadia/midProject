const jsonwebtoken = require("jsonwebtoken")
const { success, failure } = require("../constants/common");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const HTTP_STATUS = require("../constants/statusCodes");
const bookValidator = (req, res, next) => {
    try {
        const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
        const message = [];

        if (!title) {
            message.push("Title is required");
        } else if (typeof title !== 'string') {
            message.push("Title must be a string");
        }
        else if (title.length > 30) {
            message.push("Title should not exceed 30 characters");
        }

        if (!author) {
            message.push("Author is required");
        } else if (typeof author !== 'string') {
            message.push("Author must be a string");
        } else {
            if (author.length > 20) {
                message.push("Author should not exceed 20 characters");
            } else if (!/^[A-Za-z\s]+$/.test(author)) {
                message.push("Author can only contain letters (A-Z and a-z) and spaces.");
            } else {
                const parts = author.split(' ');
                for (const part of parts) {
                    if (!/^[A-Z]/.test(part)) {
                        message.push("Each part of the Author must start with an uppercase letter.");
                        break; // Break out of the loop if any part is invalid
                    }
                    if (/[A-Z]/.test(part.slice(1))) {
                        message.push("Each part of the Author after the first character can't contain capital letters.");
                        break; // Break out of the loop if any part is invalid
                    }
                }
            }
        }

        if (!category) {
            message.push("Category is required");
        } else if (typeof category !== 'string') {
            message.push("Category must be a string");
        } else if (category.length > 30) {
            message.push("Category should not exceed 30 characters");
        }

        if (!publisher) {
            message.push("Publisher is required");
        } else if (typeof publisher !== 'string') {
            message.push("Publisher must be a string");
        } else if (publisher.length > 30) {
            message.push("Publisher should not exceed 30 characters");
        }
        if (!genre) {
            message.push("Genre is required");
        }

        else if (!Array.isArray(genre) || !genre.every(item => typeof item === 'string')) {
            message.push("Genre must be an array of strings");
        } else if (genre.some(item => item.length > 30)) {
            message.push("Each genre should not exceed 30 characters");
        }
        if (!price) {
            message.push("price is required");
        }
        else if (typeof price !== 'number' || isNaN(price) || price < 20 || price > 5000) {
            message.push("Price must be a number between 20 and 5000");
        }
        if (!stock) {
            message.push("stock is required");
        }

        else if (typeof stock !== 'number' || !Number.isInteger(stock) || stock <= 0 || stock > 300) {
            message.push("Stock must be an integer between 1 and 300");
        }
        if (!pages) {
            message.push("pages is required");
        }

        else if (typeof pages !== 'number' || !Number.isInteger(pages) || pages <= 0 || pages > 2000) {
            message.push("Pages must be an integer between 1 and 2000");
        }

        if (!description) {
            message.push("Description is required");
        } else if (typeof description !== 'string' || description.length > 200) {
            message.push("Description must be a string with a maximum length of 200 characters");
        }

        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }
    } catch (error) {
        console.log("Error while adding a new book", error);
        return res.status(500).send(failure("Internal server error"));
    }
}
const bookUpdateValidator = (req, res, next) => {
    try {
        const {title}=req.query
        const {  author, price, stock, genre, pages, category, publisher, description, rate } = req.body;
        const message = [];

        if (title) {
            if (typeof title !== 'string') {
                message.push("Title must be a string");
            }
            else if (title.length > 30) {
                message.push("Title should not exceed 30 characters");
            }
        }

        if (author) {
            if (typeof author !== 'string') {
                message.push("Author must be a string");
            } else {
                if (author.length > 30) {
                    message.push("Author should not exceed 30 characters");
                } else if (!/^[A-Za-z\s]+$/.test(author)) {
                    message.push("Author can only contain letters (A-Z and a-z) and spaces.");
                } else {
                    const parts = author.split(' ');
                    for (const part of parts) {
                        if (!/^[A-Z]/.test(part)) {
                            message.push("Each part of the Author must start with an uppercase letter.");
                            break; // Break out of the loop if any part is invalid
                        }
                        if (/[A-Z]/.test(part.slice(1))) {
                            message.push("Each part of the Author after the first character can't contain capital letters.");
                            break; // Break out of the loop if any part is invalid
                        }
                    }
                }
            }
        }

        if (category) {
            if (typeof category !== 'string') {
                message.push("Category must be a string");
            } else if (category.length > 30) {
                message.push("Category should not exceed 30 characters");
            }
        }

        if (publisher) {
            if (typeof publisher !== 'string') {
                message.push("Publisher must be a string");
            } else if (publisher.length > 30) {
                message.push("Publisher should not exceed 30 characters");
            }
        }
        if (genre) {
            if (!Array.isArray(genre) || !genre.every(item => typeof item === 'string')) {
                message.push("Genre must be an array of strings");
            } else if (genre.some(item => item.length > 30)) {
                message.push("Each genre should not exceed 30 characters");
            }
        }
        if (price) {
            if (typeof price !== 'number' || isNaN(price) || price < 20 || price > 5000) {
                message.push("Price must be a number between 20 and 5000");
            }
        }
        if (stock) {


            if (typeof stock !== 'number' || !Number.isInteger(stock) || stock <= 0 || stock > 300) {
                message.push("Stock must be an integer between 1 and 300");
            }
        }
        if (rate) {


            if (typeof rate !== 'number' || rate <= 0 || stock > 5) {
                message.push("Rate must be an number between 0.1 and 5");
            }
        }
        if (pages) {


            if (typeof pages !== 'number' || !Number.isInteger(pages) || pages <= 0 || pages > 2000) {
                message.push("Pages must be an integer between 1 and 2000");
            }
        }

        if (description) {
            if (typeof description !== 'string' || description.length > 200) {
                message.push("Description must be a string with a maximum length of 200 characters");
            }
        }

        if (message.length > 0) {
            return res.status(400).send(failure(message.join(", ")));
        } else {
            next();
        }
    } catch (error) {
        console.log("Error while adding a new book", error);
        return res.status(500).send(failure("Internal server error"));
    }
    const balancedDataValidator = (req, res, next) => {
        try {
            const { balancedData } = req.body;
            if (typeof balancedData !== 'number' || balancedData < 100 || balancedData > 30000) {
                return res.status(400).send(failure("Invalid balancedData. It must be a number between 100 and 30000."));
            }
            next();
        } catch (error) {
            console.error("Error while validating balancedData", error);
            return res.status(500).send(failure("Internal server error"));
        }
    };

}
const getBookValidator = (req, res, next) => {
    try {
        const { limit, page,price, pages, stock, rate, priceFlow, stockFlow, rateFlow, pagesFlow, priceUpperBound, priceLowerBound ,sortField,order,genre} = req.query;
        const response = {};

        // Validate limit
        if(limit){
        if (!Number.isInteger(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 20) {
            response.limit = "Invalid 'limit' parameter. It must be an integer between 1 and 20.";
        }}
if(page){
        // Validate page
        if (!Number.isInteger(parseInt(page)) || parseInt(page) < 1 || parseInt(page) > 20) {
            response.page = "Invalid 'page' parameter. It must be an integer between 1 and 20.";
        }}

        // Validate priceFlow
        const validFlows = ["upper", "lower"];
        if(priceFlow){
        if (!validFlows.includes(priceFlow)) {
            response.priceFlow = "Invalid 'priceFlow' parameter. It must be either 'upper' or 'lower'.";
        }}

        // Validate stockFlow
        if(stockFlow){
        if (!validFlows.includes(stockFlow)) {
            response.stockFlow = "Invalid 'stockFlow' parameter. It must be either 'upper' or 'lower'.";
        }}

        // Validate rateFlow
        if(rateFlow){
        if (!validFlows.includes(rateFlow)) {
            response.rateFlow = "Invalid 'rateFlow' parameter. It must be either 'upper' or 'lower'.";
        }}

        // Validate pagesFlow
        if(pagesFlow){
        if (!validFlows.includes(pagesFlow)) {
            response.pagesFlow = "Invalid 'pagesFlow' parameter. It must be either 'upper' or 'lower'.";
        }}
        if ((priceUpperBound && !priceLowerBound) || (!priceUpperBound && priceLowerBound)) {
            response.priceBounds = "Both 'priceUpperBound' and 'priceLowerBound' must be provided or neither.";
        }
        
        // Validate price
        if (price && (priceUpperBound || priceLowerBound)) {
            response.price = "Either 'price' or both 'priceUpperBound' and 'priceLowerBound' must be provided.";
        }
        if (priceUpperBound&&priceLowerBound){
        // Validate priceUpperBound
        if (isNaN(priceUpperBound)) {
            response.priceUpperBound = "Invalid 'priceUpperBound' parameter. It must be a number.";
        }

        // Validate priceLowerBound
        if (isNaN(priceLowerBound)) {
            response.priceLowerBound = "Invalid 'priceLowerBound' parameter. It must be a number.";
        }
        if (parseFloat(priceLowerBound) > parseFloat(priceUpperBound)) {
            response.boundError = "Invalid price range";
            return res.status(200).send(success("Invalid price range"));
        }}
        // valid fields 
        const validSortFields = ['title', 'author', 'publisher','price', 'stock', 'rate','pages'];
        if (sortField) {
            // query param valid or not
            if (!validSortFields.includes(sortField)) {
                response.sortField = "Invalid sortField parameter";
            }

        }
        const validOrders = ['asc', 'desc'];
        if (order) {
            // query param valid or not
            if (!validOrders.includes(order)) {
                response.order = "Invalid order parameter";
            }

        }
        if (pagesFlow && !pages) {
            response.pages = "'page' parameter is required when 'pagesFlow' is provided.";
        }

        if (rateFlow && !rate) {
            response.rate = "'rate' parameter is required when 'rateFlow' is provided.";
        }

        if (priceFlow && !price) {
            response.price = "'price' parameter is required when 'priceFlow' is provided.";
        }

        if (stockFlow && !stock) {
            response.stock = "'stock' parameter is required when 'stockFlow' is provided.";
        }
        // Check if either both priceUpperBound and priceLowerBound are provided or neither
        if ((priceUpperBound && !priceLowerBound) || (!priceUpperBound && priceLowerBound)) {
            response.priceBounds = "Both 'priceUpperBound' and 'priceLowerBound' must be provided or neither.";
        }


        // Check if there are validation errors
        if (Object.keys(response).length > 0) {
            return res.status(400).send(failure({response}));
        }


        // If validation passes, continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Error while validating query parameters", error);
        
        return res.status(500).send(failure("Internal server error"));
    }
};


module.exports = { bookValidator, bookUpdateValidator, getBookValidator };
