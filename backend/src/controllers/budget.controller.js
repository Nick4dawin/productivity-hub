const Budget = require('../models/Budget');

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      user: req.user.id
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['category', 'amount', 'period', 'description', 'color'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    updates.forEach(update => budget[update] = req.body[update]);
    await budget.save();
    res.status(200).json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.status(200).json({ msg: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 