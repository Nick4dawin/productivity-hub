const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  register, 
  login, 
  googleLogin, 
  getMe 
} = require('../controllers/auth.controller');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

// Register new user
// POST /api/auth/register
router.post('/register', [
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('name').notEmpty().withMessage('Name is required'),
  validate
], register);

// Login user
// POST /api/auth/login
router.post('/login', [
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').notEmpty().withMessage('Password is required'),
  validate
], login);

// Google OAuth login
// POST /api/auth/google
router.post('/google', googleLogin);

// Get current user
// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router; 