const Mood = require('../models/Mood');

const moodController = {
  // Get all moods for a user
  getMoods: async (req, res) => {
    try {
      console.log('Getting moods for user:', req.userId);
      const moods = await Mood.find({ user: req.userId })
        .sort({ date: -1 })
        .limit(30); // Limit to last 30 entries
      console.log('Found moods:', moods.length);
      res.json(moods);
    } catch (error) {
      console.error('Error getting moods:', error);
      res.status(500).json({ message: 'Error fetching moods' });
    }
  },

  // Create a new mood entry
  createMood: async (req, res) => {
    try {
      const { mood, energy, activities, note, date } = req.body;
      console.log('Creating mood:', { mood, energy, activities, note, date });

      const newMood = new Mood({
        user: req.userId,
        mood,
        energy,
        activities,
        note,
        date: date ? new Date(date) : new Date()
      });

      const savedMood = await newMood.save();
      console.log('Created mood:', savedMood);
      res.status(201).json(savedMood);
    } catch (error) {
      console.error('Error creating mood:', error);
      res.status(400).json({ message: 'Error creating mood entry' });
    }
  },

  // Update a mood entry
  updateMood: async (req, res) => {
    try {
      const { mood, energy, activities, note } = req.body;
      console.log('Updating mood:', req.params.id, { mood, energy, activities, note });

      const updatedMood = await Mood.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { $set: { mood, energy, activities, note } },
        { new: true }
      );

      if (!updatedMood) {
        console.log('Mood not found:', req.params.id);
        return res.status(404).json({ message: 'Mood entry not found' });
      }

      console.log('Updated mood:', updatedMood);
      res.json(updatedMood);
    } catch (error) {
      console.error('Error updating mood:', error);
      res.status(400).json({ message: 'Error updating mood entry' });
    }
  },

  // Delete a mood entry
  deleteMood: async (req, res) => {
    try {
      console.log('Deleting mood:', req.params.id);
      const deletedMood = await Mood.findOneAndDelete({
        _id: req.params.id,
        user: req.userId
      });

      if (!deletedMood) {
        console.log('Mood not found:', req.params.id);
        return res.status(404).json({ message: 'Mood entry not found' });
      }

      console.log('Deleted mood:', deletedMood);
      res.json({ message: 'Mood entry deleted' });
    } catch (error) {
      console.error('Error deleting mood:', error);
      res.status(400).json({ message: 'Error deleting mood entry' });
    }
  }
};

module.exports = moodController;
