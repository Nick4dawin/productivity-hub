const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const budgetController = require('../controllers/budget.controller');

// Protect all budget routes
router.use(auth, syncUser);

// Get all budgets
router.get('/', budgetController.getBudgets);

// Create a new budget
router.post('/', budgetController.createBudget);

// Update a budget
router.put('/:id', budgetController.updateBudget);

// Delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router; 