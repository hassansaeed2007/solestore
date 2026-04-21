const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  sendCustomerOTP, verifyCustomerOTP,
  sendSellerOTP, verifySellerOTP,
  resendOTP, login, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── Customer registration (2-step OTP) ──────────────────
router.post('/register/customer/send-otp',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
  ],
  validate, sendCustomerOTP
);

router.post('/register/customer/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter 6-digit code'),
  ],
  validate, verifyCustomerOTP
);

// ── Seller registration (2-step OTP) ────────────────────
router.post('/register/seller/send-otp',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('businessAddress').trim().notEmpty().withMessage('Business address is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('cnic').trim().notEmpty().withMessage('CNIC is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('businessType').trim().notEmpty().withMessage('Business type is required'),
  ],
  validate, sendSellerOTP
);

router.post('/register/seller/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Enter 6-digit code'),
  ],
  validate, verifySellerOTP
);

// ── Resend OTP ───────────────────────────────────────────
router.post('/resend-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate, resendOTP
);

// ── Login (all roles) ────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate, login
);

router.get('/me', protect, getMe);

module.exports = router;
