const Review = require('../models/Review');
const Product = require('../models/Product');

const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment
    });

    const agg = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (agg.length) {
      product.avgRating = agg[0].avgRating;
      product.numReviews = agg[0].numReviews;
      await product.save();
    }

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.find({ product: productId }).populate('user', 'email role');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = { addReview, getReviews };
