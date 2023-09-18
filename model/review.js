const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Types.ObjectId,
    ref: 'books', // Reference to the Book model
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users', // Reference to the User model
    required: true,
  },
  reviewText: {
    type: String,
    required: true,
  },
  // You can include additional fields like rating, timestamp, etc. here
});

const reviewModel = mongoose.model('reviews', reviewSchema);

module.exports = reviewModel;
