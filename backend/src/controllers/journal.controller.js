const Journal = require('../models/Journal');
const Todo = require('../models/Todo');
const Media = require('../models/Media');
const Mood = require('../models/Mood');
const Habit = require('../models/Habit');
const { analyzeJournalEntry } = require('../services/ai.service');

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

  // Create a new journal entry
  createEntry: async (req, res) => {
    try {
      const { content, mood, energy, activities } = req.body;

      // Get AI analysis with all available context
      const analysis = await analyzeJournalEntry(content, mood, energy, activities);

      const newEntry = new Journal({
        user: req.user._id,
        content,
        mood,
        energy,
        activities,
        date: new Date(),
        analysis,
        // Add required fields
        title: content.substring(0, 50) + (content.length > 50 ? "..." : ""), // Generate title from content
        category: "Personal", // Default category
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

  // Save extracted items from journal analysis
  saveExtractedItems: async (req, res) => {
    try {
      const { journalId, mood, todos, media, habits } = req.body;
      const results = { savedItems: {} };

      // Verify that the journal entry belongs to the user
      const journalEntry = await Journal.findOne({ 
        _id: journalId,
        user: req.user._id
      });

      if (!journalEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      // Save mood if provided
      if (mood) {
        const newMood = new Mood({
          user: req.user._id,
          mood,
          energy: journalEntry.energy || 'Medium', // Default to Medium if not provided
          date: journalEntry.date,
          note: `Extracted from journal entry`,
          activities: journalEntry.activities || []
        });

        const savedMood = await newMood.save();
        results.savedItems.mood = savedMood;
      }

      // Save todos
      if (todos && todos.length > 0) {
        const savedTodos = [];
        for (const todo of todos) {
          const newTodo = new Todo({
            userId: req.user._id,
            title: todo.title,
            completed: todo.time === 'past',
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            priority: todo.priority || 'medium',
            category: 'Journal',
            notes: `Extracted from journal entry on ${new Date(journalEntry.date).toLocaleDateString()}`
          });

          const savedTodo = await newTodo.save();
          savedTodos.push(savedTodo);
        }
        results.savedItems.todos = savedTodos;
      }

      // Save media
      if (media && media.length > 0) {
        const savedMedia = [];
        for (const item of media) {
          const newMedia = new Media({
            user: req.user._id,
            title: item.title,
            type: mapMediaType(item.type),
            status: mapMediaStatus(item.status),
            genre: '', // Default empty
            source: 'journal',
            notes: `Extracted from journal entry on ${new Date(journalEntry.date).toLocaleDateString()}`
          });

          const savedMediaItem = await newMedia.save();
          savedMedia.push(savedMediaItem);
        }
        results.savedItems.media = savedMedia;
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
            const newHabit = new Habit({
              name: habit.name,
              category: 'Journal',
              frequency: habit.frequency || 'daily', // Default to daily if not specified
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

  // Get journal context for AI suggestions
  getJournalContext: async (req, res) => {
    try {
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      
      // Get user's upcoming todos (prioritize those due soon and high priority)
      const upcomingTodos = await Todo.find({
        userId: req.user._id,
        completed: false,
        dueDate: { $gte: today }
      })
      .sort({ dueDate: 1, priority: -1 })
      .limit(5);
      
      // Get recent moods to track patterns
      const recentMoods = await Mood.find({
        user: req.user._id,
        date: { $gte: oneWeekAgo }
      }).sort({ date: -1 }).limit(5);
      
      // Get active habits (focus on those with ongoing streaks)
      const activeHabits = await Habit.find({
        userId: req.user._id
      }).sort({ streak: -1 }).limit(5);
      
      // Get recently updated media items
      const recentMedia = await Media.find({
        user: req.user._id
      }).sort({ updatedAt: -1 }).limit(5);
      
      // Get recent journal entries for continuity
      const recentJournals = await Journal.find({
        user: req.user._id
      })
      .select('content date mood energy activities')
      .sort({ date: -1 })
      .limit(3);
      
      res.json({
        upcomingTodos,
        recentMoods,
        activeHabits,
        recentMedia,
        recentJournals
      });
    } catch (error) {
      console.error('Error getting journal context:', error);
      res.status(500).json({ message: 'Error getting context' });
    }
  }
};

function mapMediaType(type) {
  const typeMap = {
    'movie': 'movie',
    'show': 'tv',
    'book': 'book',
    'game': 'game',
    'podcast': 'podcast',
    'music': 'music'
  };
  
  return typeMap[type.toLowerCase()] || 'other';
}

function mapMediaStatus(status) {
  const statusMap = {
    'watched': 'completed',
    'watching': 'in_progress',
    'planned': 'planned',
    'playing': 'in_progress',
    'completed': 'completed',
    'reading': 'in_progress',
    'read': 'completed'
  };
  
  return statusMap[status.toLowerCase()] || 'other';
}

module.exports = journalController;
