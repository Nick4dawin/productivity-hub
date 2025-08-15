const UserPreferences = require('../models/UserPreferences');

/**
 * Service for managing user preferences and learning from interactions
 */
class UserPreferencesService {
  
  /**
   * Get or create user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User preferences
   */
  async getUserPreferences(userId) {
    try {
      let preferences = await UserPreferences.findOne({ userId });
      
      if (!preferences) {
        // Create default preferences for new user
        preferences = new UserPreferences({
          userId,
          suggestionTypes: ['mood', 'reflection', 'todo'],
          confidenceThreshold: 0.7,
          promptStyle: 'reflective',
          topicsOfInterest: ['productivity', 'wellness', 'creativity']
        });
        
        await preferences.save();
      }
      
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return default preferences if database fails
      return this.getDefaultPreferences(userId);
    }
  }
  
  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} updates - Preference updates
   * @returns {Promise<Object>} Updated preferences
   */
  async updateUserPreferences(userId, updates) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Update allowed fields
      const allowedFields = [
        'suggestionTypes',
        'confidenceThreshold',
        'promptStyle',
        'topicsOfInterest',
        'autoAdjustThreshold',
        'minConfidenceThreshold',
        'maxConfidenceThreshold'
      ];
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          preferences[field] = updates[field];
        }
      });
      
      preferences.lastUpdated = new Date();
      preferences.version += 1;
      
      await preferences.save();
      return preferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Track user interaction with AI suggestions
   * @param {string} userId - User ID
   * @param {string} itemType - Type of item (mood, todo, media, habit, suggestion)
   * @param {string} action - Action taken (accepted, rejected)
   * @param {number} confidence - Confidence score of the suggestion
   * @returns {Promise<void>}
   */
  async trackInteraction(userId, itemType, action, confidence = 0.7) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Update acceptance pattern
      preferences.updateAcceptancePattern(itemType, action, confidence);
      
      // Auto-adjust confidence threshold if enabled
      preferences.autoAdjustConfidenceThreshold();
      
      await preferences.save();
      
      // Log for analytics
      console.log(`Preference learning: User ${userId} ${action} ${itemType} (confidence: ${confidence})`);
      
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }
  
  /**
   * Get suggestion filters based on user preferences and learning
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Suggestion filters
   */
  async getSuggestionFilters(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences.getSuggestionFilters();
    } catch (error) {
      console.error('Error getting suggestion filters:', error);
      return this.getDefaultFilters();
    }
  }
  
  /**
   * Get acceptance statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Acceptance statistics
   */
  async getAcceptanceStats(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      const stats = {};
      Object.keys(preferences.acceptancePatterns).forEach(itemType => {
        const pattern = preferences.acceptancePatterns[itemType];
        const total = (pattern.accepted || 0) + (pattern.rejected || 0);
        
        stats[itemType] = {
          accepted: pattern.accepted || 0,
          rejected: pattern.rejected || 0,
          total,
          acceptanceRate: total > 0 ? (pattern.accepted || 0) / total : 0,
          averageConfidence: pattern.averageConfidence || 0.7
        };
      });
      
      return {
        stats,
        currentThreshold: preferences.confidenceThreshold,
        autoAdjust: preferences.autoAdjustThreshold,
        version: preferences.version,
        lastUpdated: preferences.lastUpdated
      };
    } catch (error) {
      console.error('Error getting acceptance stats:', error);
      return { stats: {}, currentThreshold: 0.7, autoAdjust: true };
    }
  }
  
  /**
   * Prioritize suggestions based on user preferences
   * @param {Array} suggestions - Array of suggestions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Prioritized suggestions
   */
  async prioritizeSuggestions(suggestions, userId) {
    try {
      const filters = await this.getSuggestionFilters(userId);
      
      // Filter by preferred types
      let filteredSuggestions = suggestions.filter(suggestion => 
        filters.types.includes(suggestion.type)
      );
      
      // Filter by confidence threshold
      filteredSuggestions = filteredSuggestions.filter(suggestion => 
        suggestion.relevance >= filters.confidenceThreshold
      );
      
      // Sort by relevance and user acceptance patterns
      filteredSuggestions.sort((a, b) => {
        const aAcceptanceRate = this.getTypeAcceptanceRate(a.type, filters.acceptancePatterns);
        const bAcceptanceRate = this.getTypeAcceptanceRate(b.type, filters.acceptancePatterns);
        
        // Combine relevance score with acceptance rate
        const aScore = (a.relevance * 0.7) + (aAcceptanceRate * 0.3);
        const bScore = (b.relevance * 0.7) + (bAcceptanceRate * 0.3);
        
        return bScore - aScore;
      });
      
      return filteredSuggestions;
    } catch (error) {
      console.error('Error prioritizing suggestions:', error);
      return suggestions; // Return original suggestions if prioritization fails
    }
  }
  
  /**
   * Get acceptance rate for a specific type
   * @private
   */
  getTypeAcceptanceRate(type, acceptancePatterns) {
    const pattern = acceptancePatterns[type];
    if (!pattern) return 0.5;
    
    const total = (pattern.accepted || 0) + (pattern.rejected || 0);
    return total > 0 ? (pattern.accepted || 0) / total : 0.5;
  }
  
  /**
   * Get default preferences for fallback
   * @private
   */
  getDefaultPreferences(userId) {
    return {
      userId,
      suggestionTypes: ['mood', 'reflection', 'todo'],
      confidenceThreshold: 0.7,
      promptStyle: 'reflective',
      topicsOfInterest: ['productivity', 'wellness', 'creativity'],
      acceptancePatterns: {},
      autoAdjustThreshold: true,
      minConfidenceThreshold: 0.3,
      maxConfidenceThreshold: 0.95
    };
  }
  
  /**
   * Get default filters for fallback
   * @private
   */
  getDefaultFilters() {
    return {
      types: ['mood', 'reflection', 'todo'],
      confidenceThreshold: 0.7,
      promptStyle: 'reflective',
      topicsOfInterest: ['productivity', 'wellness', 'creativity'],
      acceptancePatterns: {}
    };
  }
  
  /**
   * Reset user preferences to defaults
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Reset preferences
   */
  async resetPreferences(userId) {
    try {
      await UserPreferences.findOneAndDelete({ userId });
      return await this.getUserPreferences(userId); // This will create new default preferences
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      throw error;
    }
  }
  
  /**
   * Export user preferences data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Exported preferences data
   */
  async exportPreferences(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      return {
        preferences: preferences.toObject(),
        stats: await this.getAcceptanceStats(userId),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting preferences:', error);
      throw error;
    }
  }
}

module.exports = new UserPreferencesService();