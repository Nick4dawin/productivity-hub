const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const moodController = require('../controllers/mood.controller');

// Get all moods for the authenticated user
router.get('/', auth, syncUser, moodController.getMoods);

// Create a new mood entry
router.post('/', auth, syncUser, moodController.createMood);

// Update a mood entry
router.put('/:id', auth, syncUser, moodController.updateMood);

// Delete a mood entry
router.delete('/:id', auth, syncUser, moodController.deleteMood);

module.exports = router;
