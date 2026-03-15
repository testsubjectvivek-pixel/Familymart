const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validate = require('../utils/validate');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

const ordersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many orders requests, slow down.'
});

// Orders
router.post(
  '/',
  auth,
  ordersLimiter,
  [
    body('items').isArray({ min: 1 }).withMessage('Items required'),
    body('items.*.productId').optional().isMongoId(),
    body('items.*.product').optional().isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('address').isString().trim().notEmpty()
  ],
  validate,
  createOrder
);

// Admin routes
router.get('/', auth, admin, getOrders);
router.put(
  '/:id/status',
  auth,
  admin,
  [param('id').isMongoId(), body('status').isIn(['pending', 'completed', 'cancelled', 'shipped', 'out_for_delivery', 'delivered'])],
  validate,
  updateOrderStatus
);

// User routes
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, [param('id').isMongoId()], validate, getOrder);

module.exports = router;
