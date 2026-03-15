const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendEmail } = require('../utils/emailService');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const { items, address, couponCode, paymentIntentId, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'No order items' });
    }

    const ids = items.map((i) => i.productId || i.product);
    const products = await Product.find({ _id: { $in: ids } }).session(session);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const pid = (item.productId || item.product || '').toString();
      const product = productMap.get(pid);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product not found: ${pid}` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      total += product.price * item.quantity;
    }

    // Deduct stock atomically
    for (const item of orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );
      if (!result) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
      if (!coupon) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid coupon' });
      }
      if (coupon.expiryDate < new Date()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Coupon expired' });
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }
      discount = coupon.discountType === 'percent' ? (total * coupon.discountValue) / 100 : coupon.discountValue;
      discount = Math.min(discount, total);
      total -= discount;
      appliedCoupon = coupon;
    }

    const order = await Order.create(
      [{
        user: req.user._id,
        items: orderItems,
        total,
        address,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentIntentId,
        paymentStatus: paymentStatus || 'pending',
        statusHistory: [{ status: 'placed', time: new Date() }]
      }],
      { session }
    );

    if (appliedCoupon) {
      appliedCoupon.usageCount += 1;
      await appliedCoupon.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // send confirmation email (best effort)
    sendEmail({
      to: req.user.email,
      subject: 'Order placed',
      text: `Your order ${order[0]._id} was placed. Total: ${total}`
    }).catch(() => {});

    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email');
    if (!order || !order.user) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Users can only view their own orders unless admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    order.statusHistory.push({ status, time: new Date() });
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus
};
