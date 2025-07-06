const Subscription = require('../models/Subscription');

// Get all subscriptions for a user
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription({
      ...req.body,
      user: req.user.id
    });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'amount', 'billingCycle', 'category', 'nextBillingDate', 'description', 'active'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    updates.forEach(update => subscription[update] = req.body[update]);
    await subscription.save();
    res.status(200).json(subscription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.status(200).json({ msg: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 