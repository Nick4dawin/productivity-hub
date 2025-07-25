const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const journalController = require('../controllers/journal.controller');

// Get all journal entries for the authenticated user
router.get('/', auth, syncUser, journalController.getEntries);

// Create a new journal entry
router.post('/', auth, syncUser, (req, res) => {
  try {
    // Check for required fields
    const { title, content, category } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        requiredFields: {
          title: !title,
          content: !content,
          category: !category
        }
      });
    }
    
    // Proceed with controller method
    journalController.createEntry(req, res);
  } catch (error) {
    console.error('Error in create journal route:', error);
    res.status(500).json({ message: 'Server error processing journal request' });
  }
});

// Get journal context for suggestions
router.get('/context', auth, syncUser, journalController.getJournalContext);

// Save extracted items from journal analysis
router.post('/actions', auth, syncUser, journalController.saveExtractedItems);

// Update a journal entry
router.put('/:id', auth, syncUser, journalController.updateEntry);

// Delete a journal entry
router.delete('/:id', auth, syncUser, journalController.deleteEntry);

module.exports = router;
