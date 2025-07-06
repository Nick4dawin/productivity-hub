const mongoose = require('mongoose');
const Finance = require('../models/Finance');
const Account = require('../models/Account');

// @desc    Get all finance entries
// @route   GET /api/finance
// @access  Private
const getFinances = async (req, res) => {
  try {
    const finances = await Finance.find({ user: req.user.id })
      .populate('account', 'name type')
      .sort({ date: -1 });
    res.json(finances);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a finance entry
// @route   POST /api/finance
// @access  Private
const createFinance = async (req, res) => {
  const { type, category, amount, description, date, account: accountId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      throw new Error('Account not found');
    }

    const newFinance = new Finance({
      user: req.user.id,
      type,
      category,
      amount,
      description,
      date,
      account: accountId,
    });

    const finance = await newFinance.save({ session });

    // Update account balance
    account.balance += type === 'income' ? amount : -amount;
    await account.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(finance);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a finance entry
// @route   PUT /api/finance/:id
// @access  Private
const updateFinance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const financeToUpdate = await Finance.findById(req.params.id).session(session);

    if (!financeToUpdate) {
      throw new Error('Finance entry not found');
    }
    if (financeToUpdate.user.toString() !== req.user.id) {
      throw new Error('Not authorized');
    }

    const oldAmount = financeToUpdate.amount;
    const oldType = financeToUpdate.type;
    const oldAccountId = financeToUpdate.account;

    // Revert old transaction from old account
    const oldAccount = await Account.findById(oldAccountId).session(session);
    if(oldAccount) {
        oldAccount.balance -= oldType === 'income' ? oldAmount : -oldAmount;
        await oldAccount.save({ session });
    }

    const { amount, type, account: newAccountId, ...otherFields } = req.body;

    // Apply new transaction to new account
    const newAccount = await Account.findById(newAccountId).session(session);
    if(!newAccount) {
        throw new Error('New account not found');
    }
    newAccount.balance += type === 'income' ? amount : -amount;
    await newAccount.save({ session });
    
    // Update the finance entry
    const updatedFinance = await Finance.findByIdAndUpdate(req.params.id, { amount, type, account: newAccountId, ...otherFields }, { new: true, session });
    
    await session.commitTransaction();
    session.endSession();

    res.json(updatedFinance);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a finance entry
// @route   DELETE /api/finance/:id
// @access  Private
const deleteFinance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const finance = await Finance.findById(req.params.id).session(session);

    if (!finance) {
      return res.status(404).json({ msg: 'Finance entry not found' });
    }
    if (finance.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update account balance before deleting
    const account = await Account.findById(finance.account).session(session);
    if(account) {
        account.balance -= finance.type === 'income' ? finance.amount : -finance.amount;
        await account.save({ session });
    }

    await finance.remove({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ msg: 'Finance entry removed' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
}; 