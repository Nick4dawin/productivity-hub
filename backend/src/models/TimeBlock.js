const mongoose = require('mongoose');

const timeBlockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    enum: [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-cyan-600'
    ],
  },
  scheduleType: {
    type: String,
    enum: ['weekday', 'weekend'],
    required: true,
  },
  dayOfWeek: {
    type: [String],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: function() {
      return this.scheduleType === 'weekday' 
        ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        : ['saturday', 'sunday'];
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  routine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
  },
  position: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Validate that endTime is after startTime
timeBlockSchema.pre('save', function(next) {
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

// Index for efficient queries
timeBlockSchema.index({ user: 1, scheduleType: 1, startTime: 1 });
timeBlockSchema.index({ user: 1, dayOfWeek: 1 });

const TimeBlock = mongoose.model('TimeBlock', timeBlockSchema);

module.exports = TimeBlock;