const mongoose = require("mongoose");

const booksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  discount: {
    type: mongoose.Types.ObjectId,
    ref: "discounts",
  },
  discountedPrice: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  genre: [
    {
      type: String,
      required: true,
    },
  ],
  pages: {
    type: Number,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reviews: [
    {
      type: mongoose.Types.ObjectId,
      ref: "reviews",
    },
  ],
  ratings: {
    userRate: [
      {
        type: mongoose.Types.ObjectId,
        ref: "rates",
      },
    ],
    rate: {
      type: Number,
      default: 0,
    },
  },
  image: {
    type: String,
  },
});

const bookModel = mongoose.model("books", booksSchema);

module.exports = bookModel;
