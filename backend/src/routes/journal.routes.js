const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const journalController = require('../controllers/journal.controller');

// Get all journal entries for the authenticated user
router.get('/', auth, journalController.getEntries);

// Create a new journal entry
router.post('/', auth, journalController.createEntry);

// Update a journal entry
router.put('/:id', auth, journalController.updateEntry);

// Delete a journal entry
router.delete('/:id', auth, journalController.deleteEntry);

module.exports = router;
