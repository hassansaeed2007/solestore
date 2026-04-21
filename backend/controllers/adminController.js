const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendSellerStatusEmail } = require('../config/mailer');

// @desc  Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult, pendingSellers] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      User.countDocuments({ role: 'seller', sellerStatus: 'pending' }),
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        pendingSellers,
      },
      recentOrders,
    });
  } catch (err) { next(err); }
};

// @desc  Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : { role: { $ne: 'admin' } };
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

// @desc  Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// @desc  Get pending seller license requests
exports.getSellerRequests = async (req, res, next) => {
  try {
    const sellers = await User.find({ role: 'seller', sellerStatus: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (err) { next(err); }
};

// @desc  Approve seller
exports.approveSeller = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { sellerStatus: 'approved' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Send approval email (non-blocking)
    sendSellerStatusEmail(user.email, user.name, true).catch(() => {});

    res.json({ success: true, message: 'Seller approved', user });
  } catch (err) { next(err); }
};

// @desc  Reject seller
exports.rejectSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { sellerStatus: 'rejected', sellerRejectionReason: reason || 'Not approved by admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Send rejection email (non-blocking)
    sendSellerStatusEmail(user.email, user.name, false, reason || '').catch(() => {});

    res.json({ success: true, message: 'Seller rejected', user });
  } catch (err) { next(err); }
};

// @desc  Update user role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
