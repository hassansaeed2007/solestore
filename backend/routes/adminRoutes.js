const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, deleteUser,
  getSellerRequests, approveSeller, rejectSeller, updateUserRole,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Seller license requests
router.get('/seller-requests', getSellerRequests);
router.put('/seller-requests/:id/approve', approveSeller);
router.put('/seller-requests/:id/reject', rejectSeller);

module.exports = router;
