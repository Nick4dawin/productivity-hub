const express = require('express');
const { body } = require('express-validator');
const todoController = require('../controllers/todo.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const todoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

// Routes
router.use(auth); // Protect all todo routes

router.get('/', todoController.getAllTodos);
router.post('/', todoValidation, validate, todoController.createTodo);
router.get('/:id', todoController.getTodoById);
router.put('/:id', todoValidation, validate, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
