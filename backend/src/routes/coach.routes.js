const express = require('express');
const router = express.Router();
const { getSummary, getChatResponse } = require('../controllers/coach.controller');
const { auth } = require('../middleware/auth');

router.post('/summary', auth, getSummary);
router.post('/chat', auth, getChatResponse);

module.exports = router; 