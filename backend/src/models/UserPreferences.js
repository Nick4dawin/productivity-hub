const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // AI Suggestion Preferences
  suggestionTypes: {
    type: [String],
    enum: ['mood', 'todo', 'media', 'habit', 'reflection'],
    default: ['mood', 'reflection', 'todo']
  },
  
  // Confidence threshold for accepting AI suggestions
  confidenceThreshold: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 0.7
  },
  
  // Preferred prompt style
  promptStyle: {
    type: String,
    enum: ['reflective', 'actionable', 'creative', 'analytical'],
    default: 'reflective'
  },
  
  // Topics of interest for suggestions
  topicsOfInterest: {
    type: [String],
    default: ['productivity', 'wellness', 'creativity']
  },
  
  // Learning data from user interactions
  acceptancePatterns: {
    mood: {
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageConfidence: { type: Number, default: 0.7 }
    },
    todo: {
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageConfidence: { type: Number, default: 0.7 }
    },
    media: {
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageConfidence: { type: Number, default: 0.7 }
    },
    habit: {
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageConfidence: { type: Number, default: 0.7 }
    },
    suggestion: {
      accepted: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      averageRelevance: { type: Number, default: 0.7 }
    }
  },
  
  // Auto-adjustment settings
  autoAdjustThreshold: {
    type: Boolean,
    default: true
  },
  
  // Minimum confidence threshold (won't go below this even with auto-adjustment)
  minConfidenceThreshold: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 0.3
  },
  
  // Maximum confidence threshold (won't go above this even with auto-adjustment)
  maxConfidenceThreshold: {
    type: Number,
    min: 0.0,
    max: 1.0,
    default: 0.95
  },
  
  // Last updated timestamp
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Version for tracking preference evolution
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for efficient queries
userPreferencesSchema.index({ userId: 1 });

// Method to update acceptance patterns
userPreferencesSchema.methods.updateAcceptancePattern = function(itemType, action, confidence) {
  if (!this.acceptancePatterns[itemType]) {
    this.acceptancePatterns[itemType] = {
      accepted: 0,
      rejected: 0,
      averageConfidence: 0.7
    };
  }
  
  const pattern = this.acceptancePatterns[itemType];
  
  if (action === 'accepted') {
    pattern.accepted += 1;
    // Update average confidence for accepted items
    const totalAccepted = pattern.accepted;
    pattern.averageConfidence = ((pattern.averageConfidence * (totalAccepted - 1)) + confidence) / totalAccepted;
  } else if (action === 'rejected') {
    pattern.rejected += 1;
  }
  
  this.lastUpdated = new Date();
  this.markModified('acceptancePatterns');
};

// Method to calculate acceptance rate for a specific item type
userPreferencesSchema.methods.getAcceptanceRate = function(itemType) {
  const pattern = this.acceptancePatterns[itemType];
  if (!pattern) return 0.5; // Default 50% if no data
  
  const total = pattern.accepted + pattern.rejected;
  return total > 0 ? pattern.accepted / total : 0.5;
};

// Method to auto-adjust confidence threshold based on acceptance patterns
userPreferencesSchema.methods.autoAdjustConfidenceThreshold = function() {
  if (!this.autoAdjustThreshold) return;
  
  // Calculate overall acceptance rate
  let totalAccepted = 0;
  let totalRejected = 0;
  
  Object.values(this.acceptancePatterns).forEach(pattern => {
    totalAccepted += pattern.accepted || 0;
    totalRejected += pattern.rejected || 0;
  });
  
  const totalInteractions = totalAccepted + totalRejected;
  if (totalInteractions < 10) return; // Need at least 10 interactions to adjust
  
  const acceptanceRate = totalAccepted / totalInteractions;
  
  // Adjust threshold based on acceptance rate
  if (acceptanceRate > 0.8 && this.confidenceThreshold > this.minConfidenceThreshold) {
    // High acceptance rate - can lower threshold to get more suggestions
    this.confidenceThreshold = Math.max(
      this.minConfidenceThreshold,
      this.confidenceThreshold - 0.05
    );
  } else if (acceptanceRate < 0.4 && this.confidenceThreshold < this.maxConfidenceThreshold) {
    // Low acceptance rate - raise threshold to get higher quality suggestions
    this.confidenceThreshold = Math.min(
      this.maxConfidenceThreshold,
      this.confidenceThreshold + 0.05
    );
  }
  
  this.version += 1;
  this.lastUpdated = new Date();
};

// Method to get personalized suggestion filters
userPreferencesSchema.methods.getSuggestionFilters = function() {
  return {
    types: this.suggestionTypes,
    confidenceThreshold: this.confidenceThreshold,
    promptStyle: this.promptStyle,
    topicsOfInterest: this.topicsOfInterest,
    acceptancePatterns: this.acceptancePatterns
  };
};

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);