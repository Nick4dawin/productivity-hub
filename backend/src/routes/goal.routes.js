const express = require('express');
const { body } = require('express-validator');
const goalController = require('../controllers/goal.controller');
const { auth, syncUser } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth, syncUser);

const goalValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['Not Started', 'In Progress', 'Completed', 'On Hold']).withMessage('Invalid status'),
  body('timeBound').optional().isISO8601().withMessage('Invalid date format for timeBound'),
  body('milestones.*.title').optional().trim().notEmpty().withMessage('Milestone title cannot be empty'),
  body('milestones.*.dueDate').optional().isISO8601().withMessage('Invalid date format for milestone dueDate'),
];

router.post('/', goalValidation, validate, goalController.createGoal);
router.get('/', goalController.getGoals);
router.get('/:id', goalController.getGoalById);
router.put('/:id', goalValidation, validate, goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/suggest-milestones', goalController.suggestMilestones);

module.exports = router; 