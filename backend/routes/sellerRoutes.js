const express = require('express');
const router = express.Router();
const {
  getSellerOrders, getSellerStats,
  getSellerMessages, markMessageRead, sendMessage,
} = require('../controllers/sellerController');
const { protect, authorize, sellerApproved } = require('../middleware/auth');

// Seller-only routes
router.get('/stats',    protect, authorize('seller'), sellerApproved, getSellerStats);
router.get('/orders',   protect, authorize('seller'), sellerApproved, getSellerOrders);
router.get('/messages', protect, authorize('seller'), sellerApproved, getSellerMessages);
router.put('/messages/:id/read', protect, authorize('seller'), sellerApproved, markMessageRead);

// Customer sends message to a seller
router.post('/:sellerId/message', protect, authorize('customer'), sendMessage);

module.exports = router;

// Update seller bank account info
router.put('/bank-account', protect, authorize('seller'), sellerApproved, async (req, res, next) => {
  try {
    const { bankName, accountTitle, accountNumber } = req.body;
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'sellerInfo.bankName': bankName, 'sellerInfo.accountTitle': accountTitle, 'sellerInfo.accountNumber': accountNumber },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) { next(err); }
});
