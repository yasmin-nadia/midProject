const path = require("path");
const fs = require("fs").promises;
const { success, failure } = require("../constants/common");
const userModel = require("../model/user")
const authModel = require("../model/auth")
const bookModel = require("../model/book")
const reviewModel = require("../model/review")
const rateModel = require("../model/rate")
const mongoose = require('mongoose');
const express = require("express")
const app = express();
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jsonwebtoken = require("jsonwebtoken")
const moment = require('moment');
const HTTP_STATUS = require("../constants/statusCodes");

class bookController {
    async addBook(req, res) {
        try {
            const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
            const existingBook = await bookModel.findOne({ title: title });
            if (existingBook) {
                fs.appendFile("../server/print.log", `Duplicate book found before adding at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(400).send(success("This book already exists"));
            }
            const result = await bookModel.create({

                title: title,
                author: author,
                price: price,
                stock: stock,
                genre: genre,
                pages: pages,
                category: category,
                publisher: publisher,
                description: description

            })
            if (result) {
                fs.appendFile("../server/print.log", `Book addition succeeded at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(200).send(success("New book added", result));
            }
            else {
                fs.appendFile("../server/print.log", `Book addition unsuccessful at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(400).send(success("Could not add a new book"));
            }
        }

        catch (error) {
            console.log("Book add error", error)
            fs.appendFile("../server/print.log", `Book addition error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success("Internal server error"));
        }
    }
    async updateBook(req, res) {
        try {
            const { title, author, price, stock, genre, pages, category, publisher, description } = req.body;
            const existingBook = await bookModel.findOne({ title: title });
            if (!existingBook) {
                return res.status(200).send(success("This book does not exist"));
            }
            const updatedFields = {};

            // Check if each field is provided and update it if necessary
            if (title) {
                updatedFields.title = title;
            }
            if (author) {
                updatedFields.author = author;
            }
            if (price) {
                updatedFields.price = price;
            }
            if (stock) {
                updatedFields.stock = stock;
            }
            if (genre) {
                updatedFields.genre = genre;
            }
            if (pages) {
                updatedFields.pages = pages;
            }
            if (category) {
                updatedFields.category = category;
            }
            if (publisher) {
                updatedFields.publisher = publisher;
            }
            if (description) {
                updatedFields.description = description;
            }

            // Update the book document with the provided fields
            const updatedBook = await bookModel.findOneAndUpdate(
                { title: title },
                { $set: updatedFields },
                { new: true } // To return the updated book document
            );
            fs.appendFile("../server/print.log", `Book info updated at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(200).send(success("Book information updated", updatedBook));
        }

        catch (error) {
            console.log("Book update error", error)
            fs.appendFile("../server/print.log", `Book update error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success("Internal server error"));
        }
    }
    async deleteBook(req, res) {
        try {
            const { title } = req.body;
            const book = await bookModel.findOne({ title: title });

            if (!book) {
                return res.status(200).send(success(`${title} does not exist`));
            } else {
                const existingBook = await bookModel.deleteOne({ title: title });
                fs.appendFile("../server/print.log", `Book delete success at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(200).send(success(`${book.title} is deleted successfully`));
            }
        }
        catch (error) {
            console.log("Book update error", error)
            fs.appendFile("../server/print.log", `Book deletion error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success("Internal server error"));
        }
    }
    async getBook(req, res) {
        try {
            // object destructuring
            let { page, limit, searchParam, price, order, pages, priceFlow, sortField, category, stockFlow, pagesFlow, stock, priceUpperBound, priceLowerBound, rate, rateFlow, genre } = req.query;

            console.log("{page,limit}", page, limit);

            // Create a query object
            const query = {};
            if (!(page)) {
                page = 1
            }
            if (!(limit)) {
                limit = 5
            }

            // creates regular expression
            if (searchParam) {
                const regex = new RegExp(searchParam, 'i'); // 'i' flag for case-insensitive search
                query.$or = [{ category: regex }, { author: regex }, { publisher: regex }, { title: regex }, { description: regex }]; //or operation
            }

            if (stock && (stockFlow === 'upper' || stockFlow === 'lower')) {

                const stockFilter = stockFlow === 'upper' ? { $gte: parseFloat(stock) } : { $lte: parseFloat(stock) };
                query.stock = stockFilter;
            }
            else if (stock) {
                const stockFilter = { $eq: parseFloat(stock) }
                query.stock = stockFilter;
            }
            if (price && (priceFlow === 'upper' || priceFlow === 'lower')) {

                if (priceFlow === 'upper') {
                    query.price = { $gte: parseFloat(price) };
                } else {
                    query.price = { $lte: parseFloat(price) };
                }


            }
            else if (price) {
                query.price = {
                    $eq: parseFloat(price)
                };
            }
            if (priceUpperBound && priceLowerBound) {
                query.price = {
                    $gte: parseFloat(priceLowerBound),
                    $lte: parseFloat(priceUpperBound),
                };
            }
            if (query.ratings) {
                if (rate && (rateFlow === 'upper' || rateFlow === 'lower')) {
                    if (rateFlow === 'upper') {
                        query.ratings.rate = { $gte: parseFloat(rate) };
                    } else {
                        query.ratings.rate = { $lte: parseFloat(rate) };
                    }


                }
                else if (rate) {
                    console.log("2rate", rate)
                    console.log("2query.ratings.rate", query.ratings ? query.ratings.rate : null);
                    query.ratings.rate = {
                        $eq: parseFloat(rate)
                    };
                }
            }
            if (pages && (pagesFlow === 'upper' || pagesFlow === 'lower')) {

                if (pagesFlow === 'upper') {
                    query.pages = { $gte: parseFloat(pages) };
                } else {
                    query.pages = { $lte: parseFloat(pages) };
                }


            }
            else if (pages) {
                query.pages = {
                    $eq: parseFloat(pages)
                };
            }

            // pagination
            const options = {
                skip: (page - 1) * limit,
                limit: parseInt(limit),
            };
            if (sortField && !(order)) {
                options.sort = { [sortField]: 1 }; // Ascending order by default
            }

            // Sort based on any field in ascending or descending order
            if (order) {
                if (order === 'asc') {
                    options.sort = { [sortField]: 1 }; // Ascending order
                } else if (order === 'desc') {
                    options.sort = { [sortField]: -1 }; // Descending order
                } else {
                    return res.status(200).send(success("priceOrder parameter is invalid"));
                }
            }

            if (category) {
                if (Array.isArray(category)) {
                    const categoryRegex = category.map(value => new RegExp(value, 'i'));
                    query.category = { $in: categoryRegex };
                } else {
                    query.category = new RegExp(category, 'i');
                }
            }
            if (genre) {
                // Check if genre is an array or a single value
                if (Array.isArray(genre)) {
                    // If genre is an array, use regex to match any of the values
                    const genreRegex = genre.map(value => new RegExp(value, 'i')); // 'i' flag for case-insensitive search
                    query.genre = { $in: genreRegex };
                } else {
                    // If genre is a single value, use regex to match that value
                    query.genre = new RegExp(genre, 'i');
                }
            }



            // Find documents that match the query
            const books = await bookModel.find(query, null, options);

            if (books.length > 0) {
                console.log(books);
                fs.appendFile("../server/print.log", `Get book success at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(200).send(success("Successfully received", books));
            }
            if (books.length == 0) {
                fs.appendFile("../server/print.log", `No book found at at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).send(success("No books found"));
            }
        }
        catch (error) {
            console.log("Get book error", error)
            fs.appendFile("../server/print.log", `Get book error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success("Internal server error"));
        }
    }

    async addReview(req, res) {
        try {
            const { reviewText, bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                return res.status(404).json({ error: 'User is not found' });
            }

            // Check if a review with the same userId and bookId already exists
            const existingReview = await reviewModel.findOne({ bookId, userId: user._id });

            if (existingReview) {
                fs.appendFile("../server/print.log", `More than once review addition at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(400).send(failure({ error:'You have already provided a review for this book.' }));

            }

            // If no existing review found, save the new review
            const newReview = new reviewModel({
                reviewText,
                bookId,
                userId: user._id, // Use the user's ObjectId
            });

            const savedReview = await newReview.save();
            fs.appendFile("../server/print.log", `Review addition success at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(200).send(success( 'Review added successfully',{ review: savedReview }));
            



        } catch (error) {
            console.error('Add review error', error);
            fs.appendFile("../server/print.log", `Add review error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success('Internal server error'));
        }
    }
    async updateReview(req, res) {
        try {
            const { reviewText, bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                fs.appendFile("../server/print.log", `Book addition succeeded at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).send(success('User is not found' ));
        
            }

            // Check if a review with the same userId and bookId already exists
            const existingReview = await reviewModel.findOne({ bookId, userId: user._id });

            if (!(existingReview)) {
                fs.appendFile("../server/print.log", `No review found to update  at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(400).send(success('No data found to update'));

            }

            // If no existing review found, save the new review
            // Update the reviewText of the existing review
            existingReview.reviewText = reviewText;

            // Save the updated review
            const updatedReview = await existingReview.save();
            fs.appendFile("../server/print.log", `Review update success at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
        } catch (error) {
            console.error('Update review error', error);
            fs.appendFile("../server/print.log", `Review update failed at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).send(success('Internal server error'));
        }
    }
    async deleteReview(req, res) {
        try {
            const { bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                return res.status(400).json({ error: 'User is not found' });
            }
            console.log("decodedToken", decodedToken)
            const userIdAsString = user._id.toString();


            // // Delete the review based on bookId and userId
            const result2 = await reviewModel.findOne({ bookId, userId: userIdAsString });
            const result21 = await reviewModel.findOneAndDelete({ bookId, userId: userIdAsString });
            console.log("result2", result2)

            if (!result2) {
                fs.appendFile("../server/print.log", `No review found for delete at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).send(success('No data found to delete'));
               
            }
            else {
                // console.log("result1",result1,"bookId",bookId,'userId',user._id)
                fs.appendFile("../server/print.log", `Review delete success at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(200).send(success(`review is deleted successfully`));
            }
        } catch (error) {
            console.error('Update review error', error);
            fs.appendFile("../server/print.log", `Review delete error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async addRate(req, res) {
        try {
            const { rate, bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                fs.appendFile("../server/print.log", `User not found for rate add at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).json({ error: 'User is not found' });
            }

            // Check if a review with the same userId and bookId already exists
            const existingRate = await rateModel.findOne({ bookId, userId: user._id });

            if (existingRate) {
                fs.appendFile("../server/print.log", `Cant add more than one rate at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(400).json({ error: 'You have already provided a rate for this book.' });
            }

            // If no existing review found, save the new review
            const newRate = new rateModel({
                rate,
                bookId,
                userId: user._id, // Use the user's ObjectId
            });

            const savedRate = await newRate.save();
            await bookModel.updateOne(
                { _id: new mongoose.Types.ObjectId(bookId) },
                { $push: { "ratings.userRate": savedRate._id } }
            );
            const averageRate = await rateModel.aggregate([
                {
                    $match: { bookId: new mongoose.Types.ObjectId(bookId) }
                },
                {
                    $group: {
                        _id: null,
                        averageRate: { $avg: "$rate" }
                    }
                }
            ]);
            console.log("averageRate", averageRate)
            // Update the book's ratings.rate with the calculated average
            if (averageRate.length > 0) {
                const average = averageRate[0].averageRate;
                await bookModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(bookId) },
                    { $set: { "ratings.rate": average } }
                );
            }
            fs.appendFile("../server/print.log", `Rate addition succeeded at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(200).json({ message: 'Rate added successfully', rate: savedRate });



        } catch (error) {
            console.error('Add rate error', error);
            fs.appendFile("../server/print.log", `Rate addition failed at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async updateRate(req, res) {
        try {
            const { rate, bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                fs.appendFile("../server/print.log", `User not found at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).json({ error: 'User is not found' });
            }

            // Check if a review with the same userId and bookId already exists
            const existingRate = await rateModel.findOne({ bookId, userId: user._id });

            if (!existingRate) {
                fs.appendFile("../server/print.log", `No rate found to update at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).json({ error: 'No data found to update' });
            }

            // If no existing review found, save the new review
            existingRate.rate = rate;

            const savedRate = await existingRate.save();
            const averageRate = await rateModel.aggregate([
                {
                    $match: { bookId: new mongoose.Types.ObjectId(bookId) }
                },
                {
                    $group: {
                        _id: null,
                        averageRate: { $avg: "$rate" }
                    }
                }
            ]);
            console.log("averageRate", averageRate)
            // Update the book's ratings.rate with the calculated average
            if (averageRate.length > 0) {
                const average = averageRate[0].averageRate;
                await bookModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(bookId) },
                    { $set: { "ratings.rate": average } }
                );
            }
            fs.appendFile("../server/print.log", `Rte update succeeded at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(200).json({ message: 'Rate updated successfully', rate: savedRate });



        } catch (error) {
            console.error('Update rate error', error);
            fs.appendFile("../server/print.log", `Rate update error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteRate(req, res) {
        try {
            const { bookId } = req.body;
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.decode(token, process.env.SECRET_KEY);
            const user = await userModel.findOne({ email: decodedToken.email });
            if (!user) {
                return res.status(400).json({ error: 'User is not found' });
            }
            console.log("decodedToken", decodedToken)
            const userIdAsString = user._id.toString();
            const result2 = await rateModel.findOne({ bookId, userId: userIdAsString });
            const result21 = await rateModel.findOneAndDelete({ bookId, userId: userIdAsString });
            console.log("result2", result2)

            if (!result2) {
                fs.appendFile("../server/print.log", `no rate found to delete at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                return res.status(404).json({ error: 'No data found to delete' });
            }
            else {
                await bookModel.updateOne(
                    { _id: new mongoose.Types.ObjectId(bookId) },
                    {
                        $pull: {
                            "ratings.userRate": result2._id,
                            // Remove from bookModel as well
                        }
                    }
                );
                const averageRate = await rateModel.aggregate([
                    {
                        $match: { bookId: new mongoose.Types.ObjectId(bookId) }
                    },
                    {
                        $group: {
                            _id: null,
                            averageRate: { $avg: "$rate" }
                        }
                    }
                ]);
                console.log("averageRate", averageRate)
                // Update the book's ratings.rate with the calculated average
                if (averageRate.length > 0) {
                    const average = averageRate[0].averageRate;
                    await bookModel.updateOne(
                        { _id: new mongoose.Types.ObjectId(bookId) },
                        { $set: { "ratings.rate": average } }
                    );
                }
                fs.appendFile("../server/print.log", `Rate deletion succeeded at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
                // console.log("result1",result1,"bookId",bookId,'userId',user._id)
                return res.status(200).send(success(`rate is deleted successfully`));
            }
        } catch (error) {
        
            console.error('Rate review error', error);
            fs.appendFile("../server/print.log", `Rate deletion error at ${(new Date().getHours())}:${new Date().getMinutes()}:${new Date().getSeconds()} PM `);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }


}
module.exports = new bookController();