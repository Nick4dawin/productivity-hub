const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { auth, syncUser } = require('../middleware/auth');

// All routes are protected and will have the user synced
router.use(auth, syncUser);

router.get('/search', mediaController.searchExternalMedia);

router.route('/')
  .get(mediaController.getAllMedia)
  .post(mediaController.createMedia);

router.route('/:id')
  .get(mediaController.getMediaById)
  .put(mediaController.updateMedia)
  .delete(mediaController.deleteMedia);

module.exports = router; 