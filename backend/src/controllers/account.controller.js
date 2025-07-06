const Account = require('../models/Account');

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id }).sort({ name: 1 });
    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add an account
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res) => {
  const { name, type, balance } = req.body;

  try {
    const newAccount = new Account({
      user: req.user.id,
      name,
      type,
      balance,
    });

    const account = await newAccount.save();
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update an account
// @route   PUT /api/accounts/:id
// @access  Private
exports.updateAccount = async (req, res) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    account = await Account.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete an account
// @route   DELETE /api/accounts/:id
// @access  Private
// @note    This is a dangerous operation. We should prevent deleting accounts with transactions.
//          For now, we'll allow it but this should be revisited.
exports.deleteAccount = async (req, res) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ msg: 'Account not found' });
    }

    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // TODO: Add logic to check if account has transactions before deleting.

    await Account.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Account removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 