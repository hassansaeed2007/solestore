const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  addReview,
} = require('../controllers/productController');
const { protect, authorize, sellerApproved } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/my-products', protect, authorize('seller'), sellerApproved, getMyProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('seller', 'admin'), sellerApproved, upload.single('image'), createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), sellerApproved, upload.single('image'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), sellerApproved, deleteProduct);

router.post('/:id/reviews', protect, authorize('customer'), addReview);

module.exports = router;
