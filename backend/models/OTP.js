const mongoose = require('mongoose');

// Stores pending registrations until email is verified
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // Full registration data stored temporarily
  userData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  // Auto-delete after 10 minutes
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
    index: { expires: 0 }, // TTL index — MongoDB auto-deletes
  },
});

module.exports = mongoose.model('OTP', otpSchema);
