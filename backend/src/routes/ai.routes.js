const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const aiService = require('../services/ai.service');

// Generate journal prompt based on user context
router.post('/journal-prompt', auth, syncUser, async (req, res) => {
  try {
    const { todos, moods, habits, media } = req.body;
    
    const prompt = await aiService.generateJournalPrompt({ 
      todos, 
      moods, 
      habits, 
      media,
      userId: req.user._id 
    });
    
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating journal prompt:', error);
    res.status(500).json({ 
      message: 'Error generating prompt',
      prompt: 'What\'s on your mind today?'
    });
  }
});

// Analyze journal content (without saving to database)
router.post('/analyze-journal', auth, syncUser, async (req, res) => {
  try {
    const { content, mood, energy, activities } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Journal content is required' });
    }
    
    const analysis = await aiService.analyzeJournalEntry(content, mood, energy, activities);
    
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing journal content:', error);
    res.status(500).json({ message: 'Error analyzing journal content' });
  }
});

// Generate coach feedback (existing functionality)
router.post('/coach-feedback', auth, syncUser, async (req, res) => {
  try {
    const { data } = req.body;
    const summary = await aiService.getCoachSummary(data);
    res.json({ summary });
  } catch (error) {
    console.error('Error generating coach feedback:', error);
    res.status(500).json({ message: 'Error generating coach feedback' });
  }
});

module.exports = router; 