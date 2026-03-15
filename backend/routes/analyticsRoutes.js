const express = require('express');
const { salesAnalytics, productAnalytics, userAnalytics } = require('../controllers/analyticsController');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', auth, admin, salesAnalytics);
router.get('/products', auth, admin, productAnalytics);
router.get('/users', auth, admin, userAnalytics);

module.exports = router;
