/**
 * Utility functions for validating confidence scores and extracted data formats
 */

class ConfidenceValidator {
  
  /**
   * Validate confidence score range
   * @param {number} confidence - Confidence score to validate
   * @returns {boolean} - True if valid
   */
  static isValidConfidence(confidence) {
    return typeof confidence === 'number' && 
           confidence >= 0.0 && 
           confidence <= 1.0 && 
           !isNaN(confidence);
  }
  
  /**
   * Normalize confidence score to valid range
   * @param {number} confidence - Confidence score to normalize
   * @param {number} defaultValue - Default value if invalid (default: 0.5)
   * @returns {number} - Normalized confidence score
   */
  static normalizeConfidence(confidence, defaultValue = 0.5) {
    if (!this.isValidConfidence(confidence)) {
      return defaultValue;
    }
    
    // Clamp to valid range
    return Math.max(0.0, Math.min(1.0, confidence));
  }
  
  /**
   * Validate extracted mood data structure
   * @param {Object} mood - Mood data to validate
   * @returns {Object} - Validation result
   */
  static validateMoodData(mood) {
    const errors = [];
    const validMoods = ['excellent', 'good', 'neutral', 'bad', 'terrible'];
    
    if (!mood) {
      return { isValid: false, errors: ['Mood data is required'] };
    }
    
    // Handle both string and object formats
    if (typeof mood === 'string') {
      if (!validMoods.includes(mood.toLowerCase())) {
        errors.push(`Mood must be one of: ${validMoods.join(', ')}`);
        return { isValid: false, errors };
      }
      
      return {
        isValid: true,
        normalized: {
          value: mood.toLowerCase(),
          confidence: 0.5,
          reasoning: 'Default confidence for string format'
        }
      };
    }
    
    if (typeof mood === 'object') {
      if (!mood.value || typeof mood.value !== 'string') {
        errors.push('Mood value is required and must be a string');
      } else if (!validMoods.includes(mood.value.toLowerCase())) {
        errors.push(`Mood value must be one of: ${validMoods.join(', ')}`);
      }
      
      if (mood.confidence !== undefined && !this.isValidConfidence(mood.confidence)) {
        errors.push('Mood confidence must be between 0.0 and 1.0');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        normalized: {
          value: mood.value ? mood.value.toLowerCase() : '',
          confidence: this.normalizeConfidence(mood.confidence, 0.5),
          reasoning: mood.reasoning || 'No reasoning provided'
        }
      };
    }
    
    return { isValid: false, errors: ['Mood must be a string or object'] };
  }
  
  /**
   * Validate extracted todo data
   * @param {Object} todo - Todo data to validate
   * @returns {Object} - Validation result
   */
  static validateTodoData(todo) {
    const errors = [];
    
    if (!todo || typeof todo !== 'object') {
      return { isValid: false, errors: ['Todo must be an object'] };
    }
    
    if (!todo.title || typeof todo.title !== 'string') {
      errors.push('Todo title is required and must be a string');
    }
    
    if (todo.time && !['past', 'future'].includes(todo.time)) {
      errors.push('Todo time must be "past" or "future"');
    }
    
    if (todo.priority && !['low', 'medium', 'high'].includes(todo.priority)) {
      errors.push('Todo priority must be "low", "medium", or "high"');
    }
    
    if (todo.confidence !== undefined && !this.isValidConfidence(todo.confidence)) {
      errors.push('Todo confidence must be between 0.0 and 1.0');
    }
    
    if (todo.dueDate && isNaN(Date.parse(todo.dueDate))) {
      errors.push('Todo due date must be a valid date string');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      normalized: {
        title: todo.title || '',
        time: todo.time || 'future',
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate || null,
        confidence: this.normalizeConfidence(todo.confidence, 0.7),
        reasoning: todo.reasoning || 'No reasoning provided'
      }
    };
  }
  
  /**
   * Validate extracted media data
   * @param {Object} media - Media data to validate
   * @returns {Object} - Validation result
   */
  static validateMediaData(media) {
    const errors = [];
    const validTypes = ['movie', 'show', 'book', 'game', 'podcast', 'music'];
    const validStatuses = ['planned', 'watched', 'playing', 'completed', 'reading', 'read'];
    
    if (!media || typeof media !== 'object') {
      return { isValid: false, errors: ['Media must be an object'] };
    }
    
    if (!media.title || typeof media.title !== 'string') {
      errors.push('Media title is required and must be a string');
    }
    
    if (!media.type || !validTypes.includes(media.type)) {
      errors.push(`Media type must be one of: ${validTypes.join(', ')}`);
    }
    
    if (!media.status || !validStatuses.includes(media.status)) {
      errors.push(`Media status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (media.confidence !== undefined && !this.isValidConfidence(media.confidence)) {
      errors.push('Media confidence must be between 0.0 and 1.0');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      normalized: {
        title: media.title || '',
        type: media.type || 'other',
        status: media.status || 'planned',
        confidence: this.normalizeConfidence(media.confidence, 0.7),
        reasoning: media.reasoning || 'No reasoning provided'
      }
    };
  }
  
  /**
   * Validate extracted habit data
   * @param {Object} habit - Habit data to validate
   * @returns {Object} - Validation result
   */
  static validateHabitData(habit) {
    const errors = [];
    const validStatuses = ['done', 'missed'];
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    
    if (!habit || typeof habit !== 'object') {
      return { isValid: false, errors: ['Habit must be an object'] };
    }
    
    if (!habit.name || typeof habit.name !== 'string') {
      errors.push('Habit name is required and must be a string');
    }
    
    if (!habit.status || !validStatuses.includes(habit.status)) {
      errors.push(`Habit status must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (habit.frequency && !validFrequencies.includes(habit.frequency)) {
      errors.push(`Habit frequency must be one of: ${validFrequencies.join(', ')}`);
    }
    
    if (habit.confidence !== undefined && !this.isValidConfidence(habit.confidence)) {
      errors.push('Habit confidence must be between 0.0 and 1.0');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      normalized: {
        name: habit.name || '',
        status: habit.status || 'done',
        frequency: habit.frequency || 'daily',
        confidence: this.normalizeConfidence(habit.confidence, 0.7),
        reasoning: habit.reasoning || 'No reasoning provided'
      }
    };
  }
  
  /**
   * Validate complete extracted data structure
   * @param {Object} extractedData - Complete extracted data to validate
   * @returns {Object} - Validation result with normalized data
   */
  static validateExtractedData(extractedData) {
    const result = {
      isValid: true,
      errors: [],
      normalized: {
        mood: null,
        todos: [],
        media: [],
        habits: []
      }
    };
    
    // Validate mood
    if (extractedData.mood) {
      const moodValidation = this.validateMoodData(extractedData.mood);
      if (!moodValidation.isValid) {
        result.isValid = false;
        result.errors.push(...moodValidation.errors.map(e => `Mood: ${e}`));
      } else {
        result.normalized.mood = moodValidation.normalized;
      }
    }
    
    // Validate todos
    if (extractedData.todos && Array.isArray(extractedData.todos)) {
      extractedData.todos.forEach((todo, index) => {
        const todoValidation = this.validateTodoData(todo);
        if (!todoValidation.isValid) {
          result.isValid = false;
          result.errors.push(...todoValidation.errors.map(e => `Todo ${index + 1}: ${e}`));
        } else {
          result.normalized.todos.push(todoValidation.normalized);
        }
      });
    }
    
    // Validate media
    if (extractedData.media && Array.isArray(extractedData.media)) {
      extractedData.media.forEach((media, index) => {
        const mediaValidation = this.validateMediaData(media);
        if (!mediaValidation.isValid) {
          result.isValid = false;
          result.errors.push(...mediaValidation.errors.map(e => `Media ${index + 1}: ${e}`));
        } else {
          result.normalized.media.push(mediaValidation.normalized);
        }
      });
    }
    
    // Validate habits
    if (extractedData.habits && Array.isArray(extractedData.habits)) {
      extractedData.habits.forEach((habit, index) => {
        const habitValidation = this.validateHabitData(habit);
        if (!habitValidation.isValid) {
          result.isValid = false;
          result.errors.push(...habitValidation.errors.map(e => `Habit ${index + 1}: ${e}`));
        } else {
          result.normalized.habits.push(habitValidation.normalized);
        }
      });
    }
    
    return result;
  }
  
  /**
   * Get confidence level description
   * @param {number} confidence - Confidence score
   * @returns {string} - Human-readable confidence level
   */
  static getConfidenceLevel(confidence) {
    if (!this.isValidConfidence(confidence)) return 'Unknown';
    
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  }
  
  /**
   * Filter items by confidence threshold
   * @param {Array} items - Items with confidence scores
   * @param {number} threshold - Minimum confidence threshold
   * @returns {Array} - Filtered items
   */
  static filterByConfidence(items, threshold = 0.7) {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      const confidence = item.confidence || 0;
      return this.isValidConfidence(confidence) && confidence >= threshold;
    });
  }
}

module.exports = ConfidenceValidator;