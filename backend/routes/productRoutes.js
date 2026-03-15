const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../utils/validate');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productController');
const { addReview, getReviews } = require('../controllers/reviewController');
const { auth, admin } = require('../middleware/auth');

// Search autocomplete
router.get('/search', [query('q').isString().trim().isLength({ min: 1 })], validate, searchProducts);

// Public routes
router.get(
  '/',
  [
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().isString().trim().isLength({ min: 1, max: 100 })
  ],
  validate,
  getProducts
);
router.get('/:id', [param('id').isMongoId()], validate, getProduct);

// Reviews
router.get('/:id/reviews', [param('id').isMongoId()], validate, getReviews);
router.post(
  '/:id/reviews',
  auth,
  [
    param('id').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 500 })
  ],
  validate,
  addReview
);

// Admin routes
const productFields = [
  body('name').isString().trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('category').optional().isMongoId()
];

router.post('/', auth, admin, productFields, validate, createProduct);
router.put('/:id', auth, admin, [param('id').isMongoId(), ...productFields], validate, updateProduct);
router.delete('/:id', auth, admin, [param('id').isMongoId()], validate, deleteProduct);

module.exports = router;
