const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  energy: {
    type: String,
    required: true
  },
  activities: [{
    type: String
  }],
  analysis: {
    summary: String,
    insights: String,
    suggestions: [String],
    activities: [String],
    affirmations: [String],
    motivation: String,
    consolation: String
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Journal', journalSchema);
