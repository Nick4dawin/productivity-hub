const express = require('express');
const { body, query, param } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  updateTimeBlockPosition,
  getAISuggestions
} = require('../controllers/timeblock.controller');

const router = express.Router();

// Validation middleware
const validateTimeBlock = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('icon')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Icon is required'),
  body('color')
    .isIn([
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-cyan-600'
    ])
    .withMessage('Invalid color selection'),
  body('scheduleType')
    .isIn(['weekday', 'weekend'])
    .withMessage('Schedule type must be weekday or weekend'),
  body('routine')
    .optional()
    .isMongoId()
    .withMessage('Invalid routine ID')
];

const validateTimeBlockUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('icon')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Icon is required'),
  body('color')
    .optional()
    .isIn([
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600',
      'from-teal-500 to-cyan-600'
    ])
    .withMessage('Invalid color selection'),
  body('scheduleType')
    .optional()
    .isIn(['weekday', 'weekend'])
    .withMessage('Schedule type must be weekday or weekend'),
  body('routine')
    .optional()
    .isMongoId()
    .withMessage('Invalid routine ID')
];

const validatePositionUpdate = [
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid time block ID')
];

const validateAISuggestionQuery = [
  query('hour')
    .isInt({ min: 0, max: 23 })
    .withMessage('Hour must be between 0 and 23'),
  query('scheduleType')
    .isIn(['weekday', 'weekend'])
    .withMessage('Schedule type must be weekday or weekend')
];

// Routes

// GET /api/timeblocks/ai-suggestions - Get AI suggestions for empty time slots (must come before /:id routes)
router.get('/ai-suggestions', auth, validateAISuggestionQuery, getAISuggestions);

// GET /api/timeblocks - Get all time blocks for user
router.get('/', auth, getTimeBlocks);

// POST /api/timeblocks - Create a new time block
router.post('/', auth, validateTimeBlock, createTimeBlock);

// PUT /api/timeblocks/:id - Update a time block
router.put('/:id', auth, validateMongoId, validateTimeBlockUpdate, updateTimeBlock);

// DELETE /api/timeblocks/:id - Delete a time block
router.delete('/:id', auth, validateMongoId, deleteTimeBlock);

// PATCH /api/timeblocks/:id/position - Update time block position (drag and drop)
router.patch('/:id/position', auth, validateMongoId, validatePositionUpdate, updateTimeBlockPosition);

module.exports = router;