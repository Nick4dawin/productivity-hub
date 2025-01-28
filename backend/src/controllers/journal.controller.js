const Journal = require('../models/Journal');
const { analyzeJournalEntry } = require('../services/ai.service');

const journalController = {
  // Get all journal entries for a user
  getEntries: async (req, res) => {
    try {
      const entries = await Journal.find({ user: req.userId })
        .sort({ date: -1 })
        .limit(30);
      res.json(entries);
    } catch (error) {
      console.error('Error getting journal entries:', error);
      res.status(500).json({ message: 'Error fetching journal entries' });
    }
  },

  // Create a new journal entry with AI analysis
  createEntry: async (req, res) => {
    try {
      const { content, mood, energy, activities, date } = req.body;

      // Get AI analysis
      const analysis = await analyzeJournalEntry(content, mood, energy, activities);

      const newEntry = new Journal({
        user: req.userId,
        content,
        mood,
        energy,
        activities,
        analysis,
        date: date ? new Date(date) : new Date()
      });

      const savedEntry = await newEntry.save();
      res.status(201).json(savedEntry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(400).json({ message: 'Error creating journal entry' });
    }
  },

  // Update a journal entry
  updateEntry: async (req, res) => {
    try {
      const { content, mood, energy, activities } = req.body;

      // Get new AI analysis if content changed
      const analysis = content ? 
        await analyzeJournalEntry(content, mood, energy, activities) : 
        undefined;

      const updateData = {
        content,
        mood,
        energy,
        activities,
        ...(analysis && { analysis })
      };

      const updatedEntry = await Journal.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
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
        user: req.userId
      });

      if (!deletedEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }

      res.json({ message: 'Journal entry deleted' });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(400).json({ message: 'Error deleting journal entry' });
    }
  }
};

module.exports = journalController;
