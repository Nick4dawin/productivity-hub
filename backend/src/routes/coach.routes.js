const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/coach.controller');
const { auth } = require('../middleware/auth');

router.post('/summary', auth, getSummary);

module.exports = router; 