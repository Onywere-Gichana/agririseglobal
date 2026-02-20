const express = require('express');
const router = express.Router();
const { syncFromWordPress } = require('../controllers/wordpressController');
const auth = require('../middleware/auth');

router.post('/sync', auth, syncFromWordPress);

module.exports = router;
