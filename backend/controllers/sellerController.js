const Order = require('../models/Order');
const Product = require('../models/Product');
const Message = require('../models/Message');
const User = require('../models/User');
const { sendNewMessageEmail } = require('../config/mailer');

// @desc  Get orders that contain seller's products
// @route GET /api/seller/orders
exports.getSellerOrders = async (req, res, next) => {
  try {
    // Find all products by this seller
    const myProducts = await Product.find({ seller: req.user._id }).select('_id name');
    const myProductIds = myProducts.map((p) => p._id.toString());

    // Find orders that have at least one item from this seller
    const allOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Filter orders and keep only items belonging to this seller
    const sellerOrders = allOrders
      .filter((order) => order.items.some((item) => myProductIds.includes(item.product.toString())))
      .map((order) => ({
        ...order.toObject(),
        items: order.items.filter((item) => myProductIds.includes(item.product.toString())),
        sellerTotal: order.items
          .filter((item) => myProductIds.includes(item.product.toString()))
          .reduce((sum, item) => sum + item.price * item.quantity, 0),
      }));

    res.json({ success: true, orders: sellerOrders });
  } catch (err) { next(err); }
};

// @desc  Get seller stats
// @route GET /api/seller/stats
exports.getSellerStats = async (req, res, next) => {
  try {
    const myProducts = await Product.find({ seller: req.user._id }).select('_id');
    const myProductIds = myProducts.map((p) => p._id.toString());

    const allOrders = await Order.find({ status: { $ne: 'cancelled' } });

    let totalRevenue = 0;
    let totalSold = 0;
    const orderSet = new Set();

    allOrders.forEach((order) => {
      const sellerItems = order.items.filter((item) => myProductIds.includes(item.product.toString()));
      if (sellerItems.length > 0) {
        orderSet.add(order._id.toString());
        sellerItems.forEach((item) => {
          totalRevenue += item.price * item.quantity;
          totalSold += item.quantity;
        });
      }
    });

    const unreadMessages = await Message.countDocuments({ seller: req.user._id, isRead: false });

    res.json({
      success: true,
      stats: {
        totalProducts: myProducts.length,
        totalOrders: orderSet.size,
        totalRevenue,
        totalSold,
        unreadMessages,
      },
    });
  } catch (err) { next(err); }
};

// @desc  Get messages for seller
// @route GET /api/seller/messages
exports.getSellerMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ seller: req.user._id })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) { next(err); }
};

// @desc  Mark message as read
// @route PUT /api/seller/messages/:id/read
exports.markMessageRead = async (req, res, next) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// @desc  Customer sends message to seller
// @route POST /api/seller/:sellerId/message
exports.sendMessage = async (req, res, next) => {
  try {
    const { text, productId, productName } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const msg = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      seller: req.params.sellerId,
      product: productId || null,
      productName: productName || '',
      text: text.trim(),
    });

    // Email notification to seller (non-blocking)
    const seller = await User.findById(req.params.sellerId).select('name email');
    if (seller?.email) {
      sendNewMessageEmail(seller.email, seller.name, req.user.name, productName || '', text.trim()).catch(() => {});
    }

    res.status(201).json({ success: true, message: msg });
  } catch (err) { next(err); }
};
