const express = require('express');
const router = express.Router();
const { getAccounts, createAccount, updateAccount, deleteAccount } = require('../controllers/account.controller');
const { auth, syncUser } = require('../middleware/auth');

router.use(auth, syncUser);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .put(updateAccount)
  .delete(deleteAccount);

module.exports = router; 