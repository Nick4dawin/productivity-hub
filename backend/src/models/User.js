const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authMethod === 'email' || this.authMethod === 'both';
    }
  },
  profilePicture: {
    type: String
  },
  authMethod: {
    type: String,
    enum: ['email', 'google', 'both'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark' // Default theme set to dark
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
