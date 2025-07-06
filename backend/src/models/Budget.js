const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'weekly']
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget; 