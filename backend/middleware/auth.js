const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// Restrict to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role '${req.user.role}'`,
      });
    }
    next();
  };
};

// Extra check: seller must be approved to access seller routes
exports.sellerApproved = (req, res, next) => {
  if (req.user.role === 'seller' && req.user.sellerStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: req.user.sellerStatus === 'rejected'
        ? 'Your seller account has been rejected.'
        : 'Your seller account is pending admin approval.',
      sellerStatus: req.user.sellerStatus,
    });
  }
  next();
};
