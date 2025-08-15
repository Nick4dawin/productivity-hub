const Journal = require('../models/Journal');
const Todo = require('../models/Todo');
const Media = require('../models/Media');
const Mood = require('../models/Mood');
const Habit = require('../models/Habit');
const { analyzeJournalEntry, extractDataWithConfidence } = require('../services/ai.service');
const contextAggregationService = require('../services/context-aggregation.service');
const userPreferencesService = require('../services/user-preferences.service');
const ConfidenceValidator = require('../utils/confidence-validator');

const journalController = {
  // Get all journal entries for a user
  getEntries: async (req, res) => {
    try {
      const entries = await Journal.find({ user: req.user._id })
        .sort({ date: -1 })
        .limit(30);
      res.json(entries);
    } catch (error) {
      console.error('Error getting journal entries:', error);
      res.status(500).json({ message: 'Error fetching journal entries' });
    }
  },

  // Create a new journal entry with enhanced extraction
  createEntry: async (req, res) => {
    try {
      const { content, mood, energy, activities, title, category } = req.body;
      
      console.log('🚀 Journal createEntry called with:', { 
        title, 
        contentLength: content?.length, 
        category 
      });

      // Get user context for better analysis
      console.log('📊 Getting user context...');
      let userContext;
      try {
        userContext = await contextAggregationService.getLightweightContext(req.user._id);
        console.log('📊 User context received:', userContext);
      } catch (contextError) {
        console.error('⚠️ Context aggregation failed, using fallback:', contextError.message);
        userContext = { currentMood: null };
      }

      // Get enhanced AI analysis with confidence scoring
      console.log('🤖 Calling extractDataWithConfidence...');
      let analysis;
      try {
        analysis = await extractDataWithConfidence(content, {
          previousMoods: userContext.currentMood ? [{ mood: userContext.currentMood }] : [],
          recentTodos: [],
          userPreferences: { confidenceThreshold: 0.7 }
        });
        console.log('✅ AI analysis completed:', analysis);
        console.log('📋 Analysis has extracted field:', !!analysis.extracted);
      } catch (aiError) {
        console.error('💥 Enhanced AI analysis failed, falling back to basic analysis:', aiError.message);
        // Fallback to basic analysis
        const { analyzeJournalEntry } = require('../services/ai.service');
        analysis = await analyzeJournalEntry(content, mood, energy, activities);
        console.log('📋 Fallback analysis completed:', analysis);
      }

      const newEntry = new Journal({
        user: req.user._id,
        content,
        mood,
        energy,
        activities,
        date: new Date(),
        analysis,
        title: title || content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        category: category || "Personal",
      });

      await newEntry.save();
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(400).json({ message: 'Error creating journal entry' });
    }
  },

  // Update a journal entry
  updateEntry: async (req, res) => {
    try {
      const { content, mood, energy, activities, title, category } = req.body;

      // Get new AI analysis if content changed
      const analysis = content ? 
        await analyzeJournalEntry(content, mood, energy, activities) : 
        undefined;

      const updateData = {
        ...(content && { content }),
        ...(mood && { mood }),
        ...(energy && { energy }),
        ...(activities && { activities }),
        ...(title && { title }),
        ...(category && { category }),
        ...(analysis && { analysis })
      };

      const updatedEntry = await Journal.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { $set: updateData },
        { new: true }
      );

      if (!updatedEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(400).json({ message: 'Error updating journal entry' });
    }
  },

  // Delete a journal entry
  deleteEntry: async (req, res) => {
    try {
      const deletedEntry = await Journal.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });

      if (!deletedEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      res.json({ message: 'Journal entry deleted' });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(400).json({ message: 'Error deleting journal entry' });
    }
  },

  // Save extracted items from journal analysis with confidence validation
  saveExtractedItems: async (req, res) => {
    try {
      const { journalId, mood, todos, media, habits, userPreferences = {} } = req.body;
      const results = { 
        savedItems: {}, 
        errors: [], 
        partialSuccess: false,
        confidenceThreshold: userPreferences.confidenceThreshold || 0.6
      };

      // Verify that the journal entry belongs to the user
      const journalEntry = await Journal.findOne({ 
        _id: journalId,
        user: req.user._id
      });

      if (!journalEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      const confidenceThreshold = results.confidenceThreshold;

      // Save mood if provided and meets confidence threshold
      if (mood) {
        try {
          // Validate mood data using ConfidenceValidator
          const moodValidation = ConfidenceValidator.validateMoodData(mood);
          
          if (!moodValidation.isValid) {
            results.errors.push({
              type: 'mood',
              reason: 'validation_failed',
              errors: moodValidation.errors
            });
          } else {
            const normalizedMood = moodValidation.normalized;
            const moodConfidence = normalizedMood.confidence;

            if (moodConfidence >= confidenceThreshold) {
              const newMood = new Mood({
                user: req.user._id,
                mood: normalizedMood.value,
                energy: journalEntry.energy || 'Medium',
                date: journalEntry.date,
                note: `Extracted from journal entry (confidence: ${Math.round(moodConfidence * 100)}%)`,
                activities: journalEntry.activities || [],
                confidence: moodConfidence
              });

              const savedMood = await newMood.save();
              results.savedItems.mood = savedMood;
              
              // Track user preference for mood acceptance
              await journalController.trackUserPreference(req.user._id, 'mood', 'accepted', moodConfidence);
            } else {
              results.errors.push({
                type: 'mood',
                reason: 'confidence_too_low',
                confidence: moodConfidence,
                threshold: confidenceThreshold
              });
            }
          }
        } catch (error) {
          results.errors.push({
            type: 'mood',
            reason: 'save_failed',
            error: error.message
          });
        }
      }

      // Save todos with confidence validation
      if (todos && todos.length > 0) {
        const savedTodos = [];
        const todoErrors = [];

        for (const todo of todos) {
          try {
            const todoConfidence = todo.confidence || 0.8;

            if (todoConfidence >= confidenceThreshold) {
              const newTodo = new Todo({
                userId: req.user._id,
                title: todo.title,
                completed: todo.time === 'past',
                dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
                priority: todo.priority || 'medium',
                description: `Extracted from journal entry on ${new Date(journalEntry.date).toLocaleDateString()} (confidence: ${Math.round(todoConfidence * 100)}%)`
              });

              const savedTodo = await newTodo.save();
              savedTodos.push(savedTodo);
              
              // Track user preference for todo acceptance
              await journalController.trackUserPreference(req.user._id, 'todo', 'accepted', todoConfidence);
            } else {
              todoErrors.push({
                title: todo.title,
                reason: 'confidence_too_low',
                confidence: todoConfidence,
                threshold: confidenceThreshold
              });
            }
          } catch (error) {
            todoErrors.push({
              title: todo.title,
              reason: 'save_failed',
              error: error.message
            });
          }
        }

        if (savedTodos.length > 0) {
          results.savedItems.todos = savedTodos;
        }
        if (todoErrors.length > 0) {
          results.errors.push({
            type: 'todos',
            items: todoErrors
          });
        }
      }

      // Save media with confidence validation
      if (media && media.length > 0) {
        const savedMedia = [];
        const mediaErrors = [];

        for (const item of media) {
          try {
            const mediaConfidence = item.confidence || 0.8;

            if (mediaConfidence >= confidenceThreshold) {
              const newMedia = new Media({
                user: req.user._id,
                title: item.title,
                type: mapMediaType(item.type),
                status: mapMediaStatus(item.status),
                genre: '',
                review: `Extracted from journal entry on ${new Date(journalEntry.date).toLocaleDateString()} (confidence: ${Math.round(mediaConfidence * 100)}%)`
              });

              const savedMediaItem = await newMedia.save();
              savedMedia.push(savedMediaItem);
              
              // Track user preference for media acceptance
              await journalController.trackUserPreference(req.user._id, 'media', 'accepted', mediaConfidence);
            } else {
              mediaErrors.push({
                title: item.title,
                reason: 'confidence_too_low',
                confidence: mediaConfidence,
                threshold: confidenceThreshold
              });
            }
          } catch (error) {
            mediaErrors.push({
              title: item.title,
              reason: 'save_failed',
              error: error.message
            });
          }
        }

        if (savedMedia.length > 0) {
          results.savedItems.media = savedMedia;
        }
        if (mediaErrors.length > 0) {
          results.errors.push({
            type: 'media',
            items: mediaErrors
          });
        }
      }

      // Save habits
      if (habits && habits.length > 0) {
        const savedHabits = [];
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        for (const habit of habits) {
          // Check if a habit with this name already exists
          let existingHabit = await Habit.findOne({
            userId: req.user._id,
            name: { $regex: new RegExp(`^${habit.name}$`, 'i') } // Case-insensitive match
          });

          if (existingHabit) {
            // Update existing habit
            if (habit.status === 'done') {
              // Check if today's date is already in completedDates
              const todayString = today.toISOString().split('T')[0];
              const hasToday = existingHabit.completedDates.some(date => 
                date.toISOString().split('T')[0] === todayString
              );
              
              if (!hasToday) {
                existingHabit.completedDates.push(today);
                
                // Update streak
                existingHabit.streak += 1;
              }
            }
            
            // Add frequency from journal if not already set
            if (habit.frequency && !existingHabit.frequency) {
              existingHabit.frequency = habit.frequency;
            }
            
            await existingHabit.save();
            savedHabits.push(existingHabit);
          } else {
            // Create new habit
            const completedDates = habit.status === 'done' ? [today] : [];
            // Map habit to appropriate category based on name/content
            const getHabitCategory = (habitName) => {
              const name = habitName.toLowerCase();
              if (name.includes('exercise') || name.includes('workout') || name.includes('run') || name.includes('gym') || name.includes('health') || name.includes('sleep') || name.includes('water') || name.includes('meditation')) {
                return 'Health';
              } else if (name.includes('work') || name.includes('task') || name.includes('organize') || name.includes('plan') || name.includes('productivity')) {
                return 'Productivity';
              } else if (name.includes('meditat') || name.includes('mindful') || name.includes('breath') || name.includes('journal') || name.includes('reflect')) {
                return 'Mindfulness';
              } else if (name.includes('read') || name.includes('learn') || name.includes('study') || name.includes('course') || name.includes('book')) {
                return 'Learning';
              } else {
                return 'Other';
              }
            };

            const newHabit = new Habit({
              name: habit.name,
              category: getHabitCategory(habit.name),
              completedDates,
              streak: habit.status === 'done' ? 1 : 0,
              userId: req.user._id
            });

            const savedHabit = await newHabit.save();
            savedHabits.push(savedHabit);
          }
        }
        results.savedItems.habits = savedHabits;
      }

      res.json(results);
    } catch (error) {
      console.error('Error saving extracted items:', error);
      res.status(400).json({ message: 'Error saving extracted items', error: error.message });
    }
  },

  // Get journal context for AI suggestions using context aggregation service
  getJournalContext: async (req, res) => {
    try {
      const context = await contextAggregationService.getUserContext(req.user._id);
      res.json(context);
    } catch (error) {
      console.error('Error getting journal context:', error);
      res.status(500).json({ message: 'Error getting context' });
    }
  },

  // Real-time analysis endpoint for typing analysis
  analyzeRealtime: async (req, res) => {
    try {
      const { content, userId } = req.body;
      
      if (!content || content.length < 10) {
        return res.json({ analyzing: false, suggestions: [] });
      }

      // Use the real-time analysis service
      const { analyzeJournalContentRealtime } = require('../services/ai.service');
      const analysis = await analyzeJournalContentRealtime(content, userId || req.user._id);
      
      res.json(analysis);
    } catch (error) {
      console.error('Error in real-time analysis:', error);
      res.status(500).json({ 
        analyzing: false, 
        suggestions: [], 
        error: 'Analysis temporarily unavailable' 
      });
    }
  },

  // Get contextual suggestions endpoint with user preference filtering
  getSuggestions: async (req, res) => {
    try {
      const userContext = await contextAggregationService.getUserContext(req.user._id);
      const userPreferences = await userPreferencesService.getUserPreferences(req.user._id);
      
      // Add user preferences to context
      userContext.userPreferences = userPreferences.getSuggestionFilters();
      
      const { generateContextualSuggestions } = require('../services/ai.service');
      const rawSuggestions = await generateContextualSuggestions(userContext);
      
      // Prioritize suggestions based on user preferences
      const prioritizedSuggestions = await userPreferencesService.prioritizeSuggestions(
        rawSuggestions.suggestions || [],
        req.user._id
      );
      
      res.json({
        ...rawSuggestions,
        suggestions: prioritizedSuggestions,
        userPreferences: {
          confidenceThreshold: userPreferences.confidenceThreshold,
          suggestionTypes: userPreferences.suggestionTypes,
          promptStyle: userPreferences.promptStyle
        }
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      res.status(500).json({
        suggestions: [],
        fallbackPrompts: [
          "What's on your mind today?",
          "How are you feeling right now?",
          "What's one thing you want to remember about today?",
          "What are you looking forward to?",
          "What challenged you today, and how did you handle it?"
        ],
        error: 'Suggestions temporarily unavailable'
      });
    }
  },

  // Get user context endpoint for aggregated data
  getUserContextData: async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 7;
      const context = await contextAggregationService.getUserContext(req.user._id, days);
      
      res.json(context);
    } catch (error) {
      console.error('Error getting user context:', error);
      res.status(500).json({ 
        message: 'Error getting user context',
        fallback: contextAggregationService.getFallbackContext()
      });
    }
  },

  // Track user preferences for AI suggestions
  trackUserPreference: async (userId, itemType, action, confidence) => {
    try {
      await userPreferencesService.trackInteraction(userId, itemType, action, confidence);
      return true;
    } catch (error) {
      console.error('Error tracking user preference:', error);
      return false;
    }
  },

  // Get user preferences
  getUserPreferences: async (req, res) => {
    try {
      const preferences = await userPreferencesService.getUserPreferences(req.user._id);
      const stats = await userPreferencesService.getAcceptanceStats(req.user._id);
      
      res.json({
        preferences: {
          suggestionTypes: preferences.suggestionTypes,
          confidenceThreshold: preferences.confidenceThreshold,
          promptStyle: preferences.promptStyle,
          topicsOfInterest: preferences.topicsOfInterest,
          autoAdjustThreshold: preferences.autoAdjustThreshold,
          minConfidenceThreshold: preferences.minConfidenceThreshold,
          maxConfidenceThreshold: preferences.maxConfidenceThreshold
        },
        stats
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({ message: 'Error getting user preferences' });
    }
  },

  // Update user preferences
  updateUserPreferences: async (req, res) => {
    try {
      const updates = req.body;
      const preferences = await userPreferencesService.updateUserPreferences(req.user._id, updates);
      
      res.json({
        message: 'Preferences updated successfully',
        preferences: {
          suggestionTypes: preferences.suggestionTypes,
          confidenceThreshold: preferences.confidenceThreshold,
          promptStyle: preferences.promptStyle,
          topicsOfInterest: preferences.topicsOfInterest,
          autoAdjustThreshold: preferences.autoAdjustThreshold,
          minConfidenceThreshold: preferences.minConfidenceThreshold,
          maxConfidenceThreshold: preferences.maxConfidenceThreshold
        }
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: 'Error updating user preferences' });
    }
  },

  // Reset user preferences to defaults
  resetUserPreferences: async (req, res) => {
    try {
      const preferences = await userPreferencesService.resetPreferences(req.user._id);
      
      res.json({
        message: 'Preferences reset to defaults',
        preferences: {
          suggestionTypes: preferences.suggestionTypes,
          confidenceThreshold: preferences.confidenceThreshold,
          promptStyle: preferences.promptStyle,
          topicsOfInterest: preferences.topicsOfInterest,
          autoAdjustThreshold: preferences.autoAdjustThreshold
        }
      });
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      res.status(500).json({ message: 'Error resetting user preferences' });
    }
  }
};

function mapMediaType(type) {
  const typeMap = {
    'movie': 'Movie',
    'show': 'TV Show',
    'book': 'Book',
    'game': 'Game',
    'podcast': 'Movie', // Map podcast to Movie as fallback
    'music': 'Movie'    // Map music to Movie as fallback
  };
  
  return typeMap[type.toLowerCase()] || 'Movie';
}

function mapMediaStatus(status) {
  const statusMap = {
    'watched': 'Completed',
    'watching': 'In Progress',
    'planned': 'Planned',
    'playing': 'In Progress',
    'completed': 'Completed',
    'reading': 'In Progress',
    'read': 'Completed'
  };
  
  return statusMap[status.toLowerCase()] || 'Planned';
}

module.exports = journalController;
