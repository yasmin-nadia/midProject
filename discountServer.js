const express = require("express");
const app = express();
const { success, failure } = require("./constants/common");
const bookRouter = require("./route/bookRouter");
const dotenv = require("dotenv");
const cors = require("cors");
const authenController = require("./controller/authController");
const urlnotfound = require("./constants/urlnotfound");
const databaseConnection = require("./database");
const discountModel = require("./model/discounts");
const bookModel = require("./model/book");
const mongoose = require("mongoose"); // Import mongoose
const HTTP_STATUS = require("./constants/statusCodes");
dotenv.config();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
// app.use("/mybooks", bookRouter);
app.use(urlnotfound.notFound);
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status == 400 && "body" in err) {
        return res.status(400).send({ message: "You did not provide the right syntax" });
    }
});

// Function to update discount validity
const updateDiscountValidity = async () => {
    try {
        const currentTime = new Date();
        currentTime.setMilliseconds(0);

        // Change the timezone offset to a different value (e.g., UTC+02:00)
        currentTime.setUTCHours(currentTime.getUTCHours() + 6);

        // Format the modified current time as an ISO string
        // const modifiedCurrentTime = currentTime.toISOString();

        // Find all discounts
        const discounts = await discountModel.find({});

        for (const discount of discounts) {
            if (!(
                discount.startDate <= currentTime &&
                discount.endDate >= currentTime
            )) {
                // Discount is not valid, update its valid property
                discount.valid = false;
                console.log(discount.discountType, discount.startDate, discount.endDate, currentTime)
                await discount.save();

                // Find books with this discount and reset them
                const bookIdsWithDiscount = await bookModel.find({
                    'discount': discount._id
                });

                for (const book of bookIdsWithDiscount) {
                    book.discount = null; // Remove the discount property
                    book.discountedPrice = 0; // Set discountedPrice to 0
                    await book.save();
                }
            }
            else {
                console.log("else block working")
            }
        }
    } catch (error) {
        console.error("Error updating discount validity:", error);
    }
};

setInterval(updateDiscountValidity, 10000);

// Connect to the database
// mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log("Database connected successfully");
//     })
//     .catch((err) => {
//         console.error("Database connection failed:", err);
//     });

// // Start the Express app
// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// });
databaseConnection(() => {

})