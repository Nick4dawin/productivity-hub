const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
// console.log('Imported financeController:', financeController); // Debugging line
const { auth, syncUser } = require('../middleware/auth');

// @route   GET api/finance
// @desc    Get all finance entries
// @access  Private
router.get('/', auth, syncUser, financeController.getFinances);

// @route   POST api/finance
// @desc    Create a finance entry
// @access  Private
router.post('/', auth, syncUser, financeController.createFinance);

// @route   PUT api/finance/:id
// @desc    Update a finance entry
// @access  Private
router.put('/:id', auth, syncUser, financeController.updateFinance);

// @route   DELETE api/finance/:id
// @desc    Delete a finance entry
// @access  Private
router.delete('/:id', auth, syncUser, financeController.deleteFinance);

module.exports = router; 