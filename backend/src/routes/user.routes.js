const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  updateAvatar,
  deleteAccount,
  completeOnboarding
} = require('../controllers/user.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All user routes are protected
router.use(auth);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/avatar', updateAvatar);
router.put('/complete-onboarding', completeOnboarding);
router.delete('/', deleteAccount);

module.exports = router; 