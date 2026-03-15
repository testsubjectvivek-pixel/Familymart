const express = require('express');
const { body } = require('express-validator');
const validate = require('../utils/validate');
const { auth } = require('../middleware/auth');
const { createIntent, handleWebhook } = require('../controllers/paymentController');

const router = express.Router();

router.post('/intent', auth, [body('amount').isFloat({ min: 0.1 })], validate, createIntent);
router.post('/webhook', handleWebhook); // signature verification omitted in stub

module.exports = router;
