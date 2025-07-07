const express = require('express');
const { body } = require('express-validator');
const todoController = require('../controllers/todo.controller');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules for creating todos
const createTodoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

// Validation rules for updating todos - title is optional for partial updates
const updateTodoValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty if provided'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean')
];

// Routes
router.use(auth); // Protect all todo routes

router.get('/', todoController.getAllTodos);
router.post('/', createTodoValidation, validate, todoController.createTodo);
router.get('/:id', todoController.getTodoById);
router.put('/:id', updateTodoValidation, validate, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
