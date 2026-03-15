const express = require('express');
const { body, param } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const validate = require('../utils/validate');
const { createCoupon, getCoupons, applyCoupon, deleteCoupon } = require('../controllers/couponController');

const router = express.Router();

router.get('/', auth, admin, getCoupons);
router.post(
  '/',
  auth,
  admin,
  [
    body('code').isString().trim().notEmpty(),
    body('discountType').isIn(['percent', 'fixed']),
    body('discountValue').isFloat({ min: 0 }),
    body('expiryDate').isISO8601(),
    body('usageLimit').optional().isInt({ min: 0 })
  ],
  validate,
  createCoupon
);
router.post('/apply', [body('code').isString(), body('total').isFloat({ min: 0 })], validate, applyCoupon);
router.delete('/:id', auth, admin, [param('id').isMongoId()], validate, deleteCoupon);

module.exports = router;
