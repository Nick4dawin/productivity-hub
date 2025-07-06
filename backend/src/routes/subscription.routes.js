const express = require('express');
const router = express.Router();
const { auth, syncUser } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscription.controller');

// Protect all subscription routes
router.use(auth, syncUser);

// Get all subscriptions
router.get('/', subscriptionController.getSubscriptions);

// Create a new subscription
router.post('/', subscriptionController.createSubscription);

// Update a subscription
router.put('/:id', subscriptionController.updateSubscription);

// Delete a subscription
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router; 