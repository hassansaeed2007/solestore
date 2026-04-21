const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// Get messages sent by this customer
router.get('/messages', protect, authorize('customer'), async (req, res, next) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    // Add sellerName to each message
    const msgs = messages.map((m) => ({
      ...m.toObject(),
      sellerName: m.seller?.name || 'Seller',
    }));

    res.json({ success: true, messages: msgs });
  } catch (err) { next(err); }
});

module.exports = router;
