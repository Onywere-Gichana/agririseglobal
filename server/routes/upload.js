const express = require('express');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', auth, upload.single('image'), uploadImage);

module.exports = router;