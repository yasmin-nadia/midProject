const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
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
  rate: {
    type: Number,
    required: true,
  },
  // You can include additional fields like rating, timestamp, etc. here
});

const rateModel = mongoose.model('rates', rateSchema);

module.exports = rateModel;
