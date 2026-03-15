const express = require('express');
const { body, param } = require('express-validator');
const { addToWishlist, getWishlist, removeWishlist } = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');
const validate = require('../utils/validate');

const router = express.Router();

router.post('/', auth, [body('productId').isMongoId()], validate, addToWishlist);
router.get('/', auth, getWishlist);
router.delete('/:id', auth, [param('id').isMongoId()], validate, removeWishlist);

module.exports = router;
