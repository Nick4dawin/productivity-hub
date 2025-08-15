const Journal = require('../models/Journal');
const Todo = require('../models/Todo');
const Media = require('../models/Media');
const Habit = require('../models/Habit');
const Mood = require('../models/Mood');

/**
 * Aggregates user context data for AI suggestions
 */
class ContextAggregationService {
  /**
   * Get comprehensive user context for suggestion generation
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise<Object>} User context data
   */
  async getUserContext(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const [
        recentMoods,
        upcomingTodos,
        recentMedia,
        habitProgress,
        journalHistory,
        userPreferences
      ] = await Promise.all([
        this.getRecentMoods(userId, startDate),
        this.getUpcomingTodos(userId),
        this.getRecentMedia(userId, startDate),
        this.getHabitProgress(userId, startDate),
        this.getJournalHistory(userId, startDate),
        this.getUserPreferences(userId)
      ]);

      return {
        recentMoods,
        upcomingTodos,
        recentMedia,
        habitProgress,
        journalHistory,
        userPreferences,
        contextGeneratedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error aggregating user context:', error);
      return this.getFallbackContext();
    }
  }

  /**
   * Get recent mood entries
   */
  async getRecentMoods(userId, startDate) {
    try {
      const moods = await Mood.find({
        userId,
        date: { $gte: startDate }
      })
      .sort({ date: -1 })
      .limit(10)
      .lean();

      return moods.map(mood => ({
        mood: mood.mood,
        value: mood.mood,
        confidence: mood.confidence || 0.8,
        date: mood.date,
        energy: mood.energy
      }));
    } catch (error) {
      console.error('Error fetching recent moods:', error);
      return [];
    }
  }

  /**
   * Get upcoming todos
   */
  async getUpcomingTodos(userId) {
    try {
      const todos = await Todo.find({
        userId,
        completed: false,
        $or: [
          { dueDate: { $gte: new Date() } },
          { dueDate: null }
        ]
      })
      .sort({ dueDate: 1, priority: -1 })
      .limit(10)
      .lean();

      return todos.map(todo => ({
        title: todo.title,
        dueDate: todo.dueDate,
        priority: todo.priority,
        category: todo.category,
        confidence: todo.confidence || 0.9
      }));
    } catch (error) {
      console.error('Error fetching upcoming todos:', error);
      return [];
    }
  }

  /**
   * Get recent media consumption
   */
  async getRecentMedia(userId, startDate) {
    try {
      const media = await Media.find({
        user: userId, // Changed from userId to user to match your model
        $or: [
          { createdAt: { $gte: startDate } },
          { updatedAt: { $gte: startDate } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

      return media.map(item => ({
        title: item.title,
        type: item.type,
        status: item.status,
        genre: item.genre,
        confidence: item.confidence || 0.8
      }));
    } catch (error) {
      console.error('Error fetching recent media:', error);
      return [];
    }
  }

  /**
   * Get habit progress
   */
  async getHabitProgress(userId, startDate) {
    try {
      const habits = await Habit.find({
        userId
      })
      .lean();

      // Calculate streaks and recent performance based on completedDates
      const habitProgress = habits.map(habit => {
        const recentCompletions = habit.completedDates?.filter(date => 
          new Date(date) >= startDate
        ) || [];
        
        const totalDays = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
        const completionRate = totalDays > 0 ? recentCompletions.length / totalDays : 0;
        
        // Check if completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedToday = habit.completedDates?.some(date => {
          const completedDate = new Date(date);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        });

        return {
          name: habit.name,
          status: completedToday ? 'done' : 'pending',
          streak: habit.streak || 0,
          frequency: habit.frequency || 'daily',
          completionRate,
          confidence: 0.9
        };
      });

      return habitProgress;
    } catch (error) {
      console.error('Error fetching habit progress:', error);
      return [];
    }
  }

  /**
   * Get recent journal history for pattern analysis
   */
  async getJournalHistory(userId, startDate) {
    try {
      const journals = await Journal.find({
        user: userId, // Changed from userId to user to match your model
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category analysis.keywords analysis.sentiment analysis.summary createdAt')
      .lean();

      return journals.map(journal => ({
        title: journal.title,
        category: journal.category,
        keywords: journal.analysis?.keywords || [],
        sentiment: journal.analysis?.sentiment,
        summary: journal.analysis?.summary,
        date: journal.createdAt
      }));
    } catch (error) {
      console.error('Error fetching journal history:', error);
      return [];
    }
  }

  /**
   * Get user preferences (mock implementation)
   */
  async getUserPreferences(userId) {
    try {
      // In a real implementation, this would fetch from a UserPreferences model
      return {
        suggestionTypes: ['mood', 'reflection', 'todo'],
        confidenceThreshold: 0.7,
        preferredPromptStyle: 'reflective',
        topicsOfInterest: ['productivity', 'wellness', 'creativity']
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }

  /**
   * Get fallback context when database queries fail
   */
  getFallbackContext() {
    return {
      recentMoods: [
        { mood: 'neutral', confidence: 0.5, date: new Date() }
      ],
      upcomingTodos: [
        { title: 'Review daily goals', priority: 'medium', confidence: 0.8 }
      ],
      recentMedia: [
        { title: 'Personal development book', type: 'book', status: 'reading', confidence: 0.7 }
      ],
      habitProgress: [
        { name: 'Daily reflection', status: 'done', streak: 3, frequency: 'daily', confidence: 0.9 }
      ],
      journalHistory: [
        { 
          title: 'Daily thoughts', 
          keywords: ['reflection', 'goals'], 
          sentiment: 'Positive',
          date: new Date()
        }
      ],
      userPreferences: {
        suggestionTypes: ['reflection', 'mood'],
        confidenceThreshold: 0.7
      },
      contextGeneratedAt: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Get lightweight context for real-time analysis
   */
  async getLightweightContext(userId) {
    try {
      const [latestMood, activeTodos, recentJournal] = await Promise.all([
        Mood.findOne({ user: userId }).sort({ date: -1 }).lean(),
        Todo.find({ userId, completed: false }).limit(3).lean(),
        Journal.findOne({ user: userId }).sort({ createdAt: -1 }).select('analysis.keywords').lean()
      ]);

      return {
        currentMood: latestMood?.mood,
        activeTodoCount: activeTodos?.length || 0,
        recentKeywords: recentJournal?.analysis?.keywords || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting lightweight context:', error);
      return {
        currentMood: 'neutral',
        activeTodoCount: 0,
        recentKeywords: [],
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new ContextAggregationService();