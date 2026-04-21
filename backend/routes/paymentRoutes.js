const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-intent', protect, authorize('customer'), createPaymentIntent);
router.post('/confirm', protect, authorize('customer'), confirmPayment);

module.exports = router;
