const express = require('express');
const {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} = require('../controllers/account.controller');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .put(updateAccount)
  .delete(deleteAccount);

module.exports = router; 