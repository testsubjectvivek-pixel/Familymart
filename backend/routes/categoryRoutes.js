const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../utils/validate');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { auth, admin } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);

// Admin routes
router.post(
  '/',
  auth,
  admin,
  [body('name').isString().trim().notEmpty()],
  validate,
  createCategory
);
router.put(
  '/:id',
  auth,
  admin,
  [param('id').isMongoId(), body('name').isString().trim().notEmpty()],
  validate,
  updateCategory
);
router.delete('/:id', auth, admin, [param('id').isMongoId()], validate, deleteCategory);

module.exports = router;
