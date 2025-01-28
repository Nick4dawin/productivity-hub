const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const moodController = require('../controllers/mood.controller');

// Get all moods for the authenticated user
router.get('/', auth, moodController.getMoods);

// Create a new mood entry
router.post('/', auth, moodController.createMood);

// Update a mood entry
router.put('/:id', auth, moodController.updateMood);

// Delete a mood entry
router.delete('/:id', auth, moodController.deleteMood);

module.exports = router;
