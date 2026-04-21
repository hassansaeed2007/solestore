const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerInfoSchema = new mongoose.Schema({
  businessName:   { type: String, default: '' },
  businessAddress:{ type: String, default: '' },
  phone:          { type: String, default: '' },
  cnic:           { type: String, default: '' },
  licenseNumber:  { type: String, default: '' },
  businessType:   { type: String, default: '' },
  description:    { type: String, default: '' },
  website:        { type: String, default: '' },
  // Bank / payment account
  bankName:       { type: String, default: '' },
  accountTitle:   { type: String, default: '' },
  accountNumber:  { type: String, default: '' },
  stripeAccountId:{ type: String, default: '' }, // Stripe Connect account id
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    // Seller-specific fields
    sellerInfo: { type: sellerInfoSchema, default: null },
    // pending = waiting admin approval, approved = can sell, rejected = denied
    sellerStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null,
    },
    sellerRejectionReason: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
