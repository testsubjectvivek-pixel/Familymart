const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const validate = require('../utils/validate');
const {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many registrations from this IP, try later.'
});

// Public routes with validation and rate limit
router.post(
  '/register',
  registerLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
    body('password').matches(/[A-Z]/).withMessage('Include at least one uppercase'),
    body('password').matches(/[0-9]/).withMessage('Include at least one digit')
  ],
  validate,
  registerUser
);
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  loginUser
);

// Private
router.get('/profile', auth, getProfile);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;
