const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: false, // Name might not always be available
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
