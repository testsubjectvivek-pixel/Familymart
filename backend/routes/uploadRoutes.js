const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadController');
const { auth, admin } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

router.post('/', auth, admin, upload.single('image'), uploadImage);

module.exports = router;
