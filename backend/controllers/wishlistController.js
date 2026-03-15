const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const item = await Wishlist.findOneAndUpdate(
      { user: req.user._id, product: productId },
      { user: req.user._id, product: productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('product');
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate('product');
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const removeWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Wishlist.deleteOne({ _id: id, user: req.user._id });
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addToWishlist, getWishlist, removeWishlist };
