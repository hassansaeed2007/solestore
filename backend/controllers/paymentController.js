const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const {
  sendOrderConfirmationEmail, sendSellerOrderEmail,
  sendAdminOrderEmail, sendPaymentConfirmationEmail,
} = require('../config/mailer');

// @desc  Create Stripe payment intent
// @route POST /api/payment/create-intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Amount in cents
    const amount = Math.round(cart.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: cart.totalPrice,
    });
  } catch (err) { next(err); }
};

// @desc  Confirm payment and create order
// @route POST /api/payment/confirm
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, shippingAddress } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image.url,
        price: item.price,
        quantity: item.quantity,
      });
      // Decrement stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice: cart.totalPrice,
      isPaid: true,
      paidAt: new Date(),
      paymentIntentId,
    });

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    // Send emails
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    sendOrderConfirmationEmail(req.user.email, req.user.name, populatedOrder).catch(() => {});
    sendPaymentConfirmationEmail(req.user.email, req.user.name, populatedOrder.totalPrice, populatedOrder._id).catch(() => {});
    sendAdminOrderEmail({ ...populatedOrder.toObject(), user: populatedOrder.user }).catch(() => {});

    // Notify sellers
    const sellerMap = {};
    for (const item of cart.items) {
      const p = item.product;
      if (!p?.seller) continue;
      const sid = p.seller.toString();
      if (!sellerMap[sid]) sellerMap[sid] = [];
      sellerMap[sid].push({ name: p.name, quantity: item.quantity, price: item.price });
    }
    for (const [sid, items] of Object.entries(sellerMap)) {
      const seller = await User.findById(sid).select('name email');
      if (seller?.email) sendSellerOrderEmail(seller.email, seller.name, { ...populatedOrder.toObject(), user: populatedOrder.user }, items).catch(() => {});
    }

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};
