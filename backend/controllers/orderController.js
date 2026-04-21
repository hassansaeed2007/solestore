const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const {
  sendOrderConfirmationEmail, sendSellerOrderEmail,
  sendAdminOrderEmail, sendOrderStatusEmail,
} = require('../config/mailer');

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock and build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ success: false, message: 'A product in your cart no longer exists' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image.url,
        price: item.price,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice: cart.totalPrice,
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart after order
    await Cart.findOneAndDelete({ user: req.user._id });

    // Populate user for emails
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Send emails (non-blocking)
    // 1. Customer confirmation
    sendOrderConfirmationEmail(req.user.email, req.user.name, populatedOrder).catch(() => {});

    // 2. Notify each seller whose products were ordered
    const sellerProductMap = {};
    for (const item of cart.items) {
      const product = item.product;
      if (!product?.seller) continue;
      const sellerId = product.seller.toString();
      if (!sellerProductMap[sellerId]) sellerProductMap[sellerId] = [];
      sellerProductMap[sellerId].push({ name: product.name, quantity: item.quantity, price: item.price });
    }
    for (const [sellerId, items] of Object.entries(sellerProductMap)) {
      const seller = await User.findById(sellerId).select('name email');
      if (seller?.email) {
        sendSellerOrderEmail(seller.email, seller.name, { ...populatedOrder.toObject(), user: populatedOrder.user }, items).catch(() => {});
      }
    }

    // 3. Admin notification
    sendAdminOrderEmail({ ...populatedOrder.toObject(), user: populatedOrder.user }).catch(() => {});

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.deliveredAt = Date.now();
    }

    await order.save();

    // Send status update email to customer (non-blocking)
    const customer = await User.findById(order.user).select('name email');
    if (customer?.email) {
      const extras = status === 'shipped' ? { trackingNote: 'Your package is on its way! Expected delivery in 3-5 business days.' } : {};
      sendOrderStatusEmail(customer.email, customer.name, order._id, status, extras).catch(() => {});
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
