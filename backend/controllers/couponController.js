const Coupon = require('../models/Coupon');

const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const { code, total } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });
    if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon expired' });
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
    const amount = Number(total) || 0;
    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (amount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    const newTotal = Math.max(0, amount - discount);
    res.json({ valid: true, discount, newTotal, coupon });
  } catch (err) {
    next(err);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCoupon, getCoupons, applyCoupon, deleteCoupon };
