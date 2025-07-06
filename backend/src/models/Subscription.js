const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'weekly', 'quarterly']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 