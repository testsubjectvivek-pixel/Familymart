const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const salesAnalytics = async (req, res, next) => {
  try {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: last30 }, paymentStatus: { $in: ['paid', 'pending'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(sales);
  } catch (err) {
    next(err);
  }
};

const productAnalytics = async (req, res, next) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', qty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);
    res.json(topProducts);
  } catch (err) {
    next(err);
  }
};

const userAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    res.json({ totalUsers, admins });
  } catch (err) {
    next(err);
  }
};

module.exports = { salesAnalytics, productAnalytics, userAnalytics };
