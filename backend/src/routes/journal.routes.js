const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const journalController = require('../controllers/journal.controller');

// Get all journal entries for the authenticated user
router.get('/', auth, syncUser, journalController.getEntries);

// Create a new journal entry
router.post('/', auth, syncUser, journalController.createEntry);

// Update a journal entry
router.put('/:id', auth, syncUser, journalController.updateEntry);

// Delete a journal entry
router.delete('/:id', auth, syncUser, journalController.deleteEntry);

module.exports = router;
