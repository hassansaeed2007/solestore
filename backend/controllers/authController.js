const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail, sendNewSellerRegistrationEmail } = require('../config/mailer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  sellerStatus: user.sellerStatus || null,
  sellerInfo: user.sellerInfo || null,
});

// Generate a 6-digit OTP
const makeOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ─────────────────────────────────────────────
// STEP 1: Send OTP to email (customer)
// POST /api/auth/register/customer/send-otp
// ─────────────────────────────────────────────
exports.sendCustomerOTP = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already registered
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = makeOTP();

    // Remove any previous OTP for this email
    await OTP.deleteMany({ email });

    // Save pending registration + OTP
    await OTP.create({
      email,
      otp,
      userData: { name, email, password, role: 'customer' },
    });

    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// STEP 2: Verify OTP and create customer account
// POST /api/auth/register/customer/verify-otp
// ─────────────────────────────────────────────
exports.verifyCustomerOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Create the user
    const user = await User.create(record.userData);
    await OTP.deleteMany({ email });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: userPayload(user) });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// STEP 1: Send OTP to email (seller)
// POST /api/auth/register/seller/send-otp
// ─────────────────────────────────────────────
exports.sendSellerOTP = async (req, res, next) => {
  try {
    const { name, email, password, businessName, businessAddress, phone, cnic, licenseNumber, businessType, description, website } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = makeOTP();
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp,
      userData: {
        name, email, password,
        role: 'seller',
        sellerStatus: 'pending',
        sellerInfo: { businessName, businessAddress, phone, cnic, licenseNumber, businessType, description, website: website || '' },
      },
    });

    await sendOTPEmail(email, otp, name);

    res.json({ success: true, message: 'Verification code sent to your email' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// STEP 2: Verify OTP and create seller account
// POST /api/auth/register/seller/verify-otp
// ─────────────────────────────────────────────
exports.verifySellerOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const user = await User.create(record.userData);
    await OTP.deleteMany({ email });

    // Notify admin about new seller application (non-blocking)
    sendNewSellerRegistrationEmail(user).catch(() => {});

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: userPayload(user) });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// Resend OTP
// POST /api/auth/resend-otp
// ─────────────────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const record = await OTP.findOne({ email });
    if (!record) {
      return res.status(400).json({ success: false, message: 'No pending registration found for this email' });
    }

    const otp = makeOTP();
    record.otp = otp;
    record.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await record.save();

    await sendOTPEmail(email, otp, record.userData.name);

    res.json({ success: true, message: 'New verification code sent' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// Login (all roles)
// POST /api/auth/login
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: userPayload(user) });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// Get current user
// GET /api/auth/me
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: userPayload(req.user) });
};
