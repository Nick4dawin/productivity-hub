const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo',
  }],
  habits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
  }],
  type: {
    type: String,
    enum: ['Morning', 'Evening', 'Custom'],
    default: 'Custom',
  }
}, {
  timestamps: true,
});

const Routine = mongoose.model('Routine', routineSchema);

module.exports = Routine; 