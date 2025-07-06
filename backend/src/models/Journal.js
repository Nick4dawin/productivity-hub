const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
  },
  mood: {
    type: String,
  },
  energy: {
    type: String,
  },
  activities: [{
    type: String
  }],
  analysis: {
    summary: String,
    sentiment: String,
    keywords: [String],
    suggestions: [String],
    insights: String,
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
