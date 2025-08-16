const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  note: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['manual', 'journal_ai'],
    default: 'manual'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mood', moodSchema);
