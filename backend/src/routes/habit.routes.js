const express = require('express');
const { body } = require('express-validator');
const habitController = require('../controllers/habit.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const habitValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['Health', 'Productivity', 'Mindfulness', 'Learning', 'Other'])
    .withMessage('Invalid category')
];

// Routes
router.use(auth); // Protect all habit routes

router.get('/', habitController.getAllHabits);
router.post('/', habitValidation, validate, habitController.createHabit);
router.get('/:id', habitController.getHabitById);
router.put('/:id', habitValidation, validate, habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/toggle/:date', habitController.toggleHabitDate);

module.exports = router;
