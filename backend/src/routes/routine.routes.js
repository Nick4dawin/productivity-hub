const express = require('express');
const { body } = require('express-validator');
const routineController = require('../controllers/routine.controller');
const { auth, syncUser } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Protect all routes
router.use(auth, syncUser);

// Validation rules
const routineValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').optional().isIn(['Morning', 'Evening', 'Custom']).withMessage('Invalid type'),
];

// Routes
router.post('/', routineValidation, validate, routineController.createRoutine);
router.get('/', routineController.getRoutines);
router.get('/:id', routineController.getRoutineById);
router.put('/:id', routineValidation, validate, routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);

module.exports = router; 