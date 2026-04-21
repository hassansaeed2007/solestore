const nodemailer = require('nodemailer');

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // your Gmail address
    pass: process.env.GMAIL_PASS,   // Gmail App Password (not your real password)
  },
});

/**
 * Send OTP verification email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - recipient name
 */
const sendOTPEmail = async (to, otp, name = 'User') => {
  const mailOptions = {
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your SoleStore Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1a2e; font-size: 28px; margin: 0;">👟 SoleStore</h1>
        </div>
        <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <h2 style="color: #1a1a2e; margin-top: 0;">Email Verification</h2>
          <p style="color: #6c757d; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #6c757d; line-height: 1.6;">
            Use the verification code below to complete your registration. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #1a1a2e; color: white; font-size: 36px; font-weight: 800; letter-spacing: 10px; padding: 16px 32px; border-radius: 10px;">
              ${otp}
            </div>
          </div>
          <p style="color: #aaa; font-size: 13px; text-align: center;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} SoleStore. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send seller approval/rejection email
 */
const sendSellerStatusEmail = async (to, name, approved, reason = '') => {
  const mailOptions = {
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: approved ? '🎉 Your Seller Account is Approved!' : 'SoleStore Seller Application Update',
    html: approved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a2e;">👟 SoleStore</h1>
          </div>
          <div style="background: white; border-radius: 10px; padding: 30px;">
            <h2 style="color: #28a745;">🎉 Congratulations, ${name}!</h2>
            <p style="color: #6c757d; line-height: 1.6;">
              Your seller account has been <strong style="color: #28a745;">approved</strong>. You can now log in to your seller dashboard and start listing your products.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${process.env.CLIENT_URL}/login/seller" style="background: #1a1a2e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700;">
                Go to Seller Dashboard
              </a>
            </div>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f8f9fa; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1a1a2e;">👟 SoleStore</h1>
          </div>
          <div style="background: white; border-radius: 10px; padding: 30px;">
            <h2 style="color: #dc3545;">Application Not Approved</h2>
            <p style="color: #6c757d; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
            <p style="color: #6c757d; line-height: 1.6;">
              Unfortunately, your seller application was not approved at this time.
            </p>
            ${reason ? `<div style="background: #fff5f5; border-left: 4px solid #dc3545; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <strong>Reason:</strong> ${reason}
            </div>` : ''}
            <p style="color: #6c757d; font-size: 13px;">
              You may re-apply with updated information or contact our support team.
            </p>
          </div>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send order confirmation email to customer
 */
const sendOrderConfirmationEmail = async (to, name, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a42;color:#ccc;font-size:13px;">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a42;color:#ccc;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2a2a42;color:#a78bfa;font-size:13px;text-align:right;font-weight:700;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mail = {
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: `✅ Order Confirmed — #${String(order._id).slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0d0d14;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#7c6fff,#a855f7);padding:32px 28px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">👟</div>
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Order Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Thank you for shopping with SoleStore</p>
        </div>
        <div style="padding:28px;">
          <p style="color:#ccc;font-size:14px;margin:0 0 20px;">Hi <strong style="color:white;">${name}</strong>, your order has been placed successfully.</p>
          <div style="background:#16162a;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="color:#8b8fa8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order ID</p>
            <p style="color:#a78bfa;font-size:18px;font-weight:800;font-family:monospace;margin:0;">#${String(order._id).slice(-8).toUpperCase()}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead><tr style="background:#1a1a2e;">
              <th style="padding:8px 12px;text-align:left;color:#8b8fa8;font-size:11px;text-transform:uppercase;">Item</th>
              <th style="padding:8px 12px;text-align:center;color:#8b8fa8;font-size:11px;text-transform:uppercase;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#8b8fa8;font-size:11px;text-transform:uppercase;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="background:#16162a;border-radius:10px;padding:14px 20px;display:flex;justify-content:space-between;margin-bottom:20px;">
            <span style="color:#8b8fa8;font-size:14px;">Order Total</span>
            <span style="color:#a78bfa;font-size:18px;font-weight:900;">$${order.totalPrice.toFixed(2)}</span>
          </div>
          <div style="background:#16162a;border-radius:10px;padding:14px 20px;margin-bottom:24px;">
            <p style="color:#8b8fa8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Shipping To</p>
            <p style="color:#ccc;font-size:13px;margin:0;line-height:1.6;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:block;background:linear-gradient(135deg,#7c6fff,#a855f7);color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Track Your Order →</a>
        </div>
        <div style="padding:16px 28px;border-top:1px solid #1a1a2e;text-align:center;">
          <p style="color:#4a4a6a;font-size:12px;margin:0;">© 2025 SoleStore. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mail);
};

/**
 * Send new order notification to seller
 */
const sendSellerOrderEmail = async (to, sellerName, order, items) => {
  const itemsHtml = items.map(item => `<li style="color:#ccc;font-size:13px;padding:4px 0;">${item.name} × ${item.quantity} — <strong style="color:#a78bfa;">$${(item.price * item.quantity).toFixed(2)}</strong></li>`).join('');
  const mail = {
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🛍️ New Order Received — #${String(order._id).slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0d0d14;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0f3460,#533483);padding:28px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">🎉 New Order!</h1>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">A customer just ordered your product(s)</p>
        </div>
        <div style="padding:24px;">
          <p style="color:#ccc;font-size:14px;">Hi <strong style="color:white;">${sellerName}</strong>,</p>
          <div style="background:#16162a;border-radius:10px;padding:14px 18px;margin:16px 0;">
            <p style="color:#8b8fa8;font-size:11px;text-transform:uppercase;margin:0 0 4px;">Order ID</p>
            <p style="color:#a78bfa;font-size:16px;font-weight:800;font-family:monospace;margin:0;">#${String(order._id).slice(-8).toUpperCase()}</p>
          </div>
          <p style="color:#8b8fa8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Items Ordered</p>
          <ul style="margin:0 0 16px;padding-left:16px;">${itemsHtml}</ul>
          <div style="background:#16162a;border-radius:10px;padding:12px 18px;margin-bottom:20px;">
            <p style="color:#8b8fa8;font-size:12px;margin:0 0 4px;">Customer</p>
            <p style="color:white;font-size:14px;font-weight:600;margin:0;">${order.user?.name || 'Customer'} — ${order.user?.email || ''}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/seller" style="display:block;background:linear-gradient(135deg,#0f3460,#533483);color:white;text-align:center;padding:13px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">View in Dashboard →</a>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mail);
};

/**
 * Send new order notification to admin
 */
const sendAdminOrderEmail = async (order) => {
  const mail = {
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `📦 New Order — #${String(order._id).slice(-8).toUpperCase()} — $${order.totalPrice.toFixed(2)}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0d0d14;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1a1a2e,#0f3460);padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:18px;font-weight:800;">🛒 New Order Placed</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ['Order ID', `#${String(order._id).slice(-8).toUpperCase()}`],
              ['Customer', `${order.user?.name} (${order.user?.email})`],
              ['Total', `$${order.totalPrice.toFixed(2)}`],
              ['Items', order.items.length],
              ['Status', order.status],
            ].map(([k,v]) => `<tr><td style="padding:8px 12px;color:#8b8fa8;font-size:13px;width:40%;">${k}</td><td style="padding:8px 12px;color:white;font-size:13px;font-weight:600;">${v}</td></tr>`).join('')}
          </table>
          <a href="${process.env.CLIENT_URL}/admin" style="display:block;background:linear-gradient(135deg,#7c6fff,#a855f7);color:white;text-align:center;padding:13px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:20px;">View in Admin Panel →</a>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mail);
};

module.exports = { sendOTPEmail, sendSellerStatusEmail, sendOrderConfirmationEmail, sendSellerOrderEmail, sendAdminOrderEmail };

// ─── Helper: base email wrapper ───────────────────────────
const baseHtml = (content) => `
<div style="font-family:Inter,Arial,sans-serif;max-width:580px;margin:0 auto;background:#0d0d14;border-radius:16px;overflow:hidden;border:1px solid #1a1a2e;">
  <div style="background:linear-gradient(135deg,#7c6fff,#a855f7);padding:24px 28px;display:flex;align-items:center;gap:12px;">
    <span style="font-size:28px;">👟</span>
    <div>
      <h1 style="color:white;margin:0;font-size:18px;font-weight:800;letter-spacing:-0.3px;">SoleStore</h1>
      <p style="color:rgba(255,255,255,0.7);margin:0;font-size:12px;">Notification</p>
    </div>
  </div>
  <div style="padding:28px;">${content}</div>
  <div style="padding:16px 28px;border-top:1px solid #1a1a2e;text-align:center;">
    <p style="color:#4a4a6a;font-size:11px;margin:0;">© 2025 SoleStore · You received this because you have an account with us.</p>
  </div>
</div>`;

const btn = (text, url) => `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7c6fff,#a855f7);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:20px;">${text}</a>`;

const infoRow = (label, value) => `<tr><td style="padding:7px 12px;color:#8b8fa8;font-size:12px;width:38%;">${label}</td><td style="padding:7px 12px;color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;">${value}</td></tr>`;

// ─── Order Status Changed → Customer ──────────────────────
const sendOrderStatusEmail = async (to, name, orderId, status, extra = {}) => {
  const statusConfig = {
    processing: { icon: '⚙️', color: '#60a5fa', title: 'Order is Being Processed', msg: 'Your order is now being processed by the seller.' },
    shipped:    { icon: '🚚', color: '#a78bfa', title: 'Your Order Has Shipped!', msg: 'Great news! Your order is on its way to you.' },
    delivered:  { icon: '✅', color: '#34d399', title: 'Order Delivered!', msg: 'Your order has been delivered. Enjoy your new shoes!' },
    cancelled:  { icon: '❌', color: '#f87171', title: 'Order Cancelled', msg: 'Your order has been cancelled.' },
  };
  const cfg = statusConfig[status] || { icon: '📦', color: '#a78bfa', title: `Order ${status}`, msg: `Your order status has been updated to ${status}.` };
  const shortId = String(orderId).slice(-8).toUpperCase();

  await transporter.sendMail({
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${cfg.icon} Order #${shortId} — ${cfg.title}`,
    html: baseHtml(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:8px;">${cfg.icon}</div>
        <h2 style="color:white;margin:0;font-size:20px;">${cfg.title}</h2>
        <p style="color:#8b8fa8;margin:6px 0 0;font-size:14px;">Hi ${name}</p>
      </div>
      <div style="background:#16162a;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="color:#8b8fa8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order ID</p>
        <p style="color:${cfg.color};font-size:20px;font-weight:900;font-family:monospace;margin:0;">#${shortId}</p>
      </div>
      <p style="color:#ccc;font-size:14px;line-height:1.7;margin:0 0 20px;">${cfg.msg}</p>
      ${extra.trackingNote ? `<div style="background:rgba(124,111,255,0.1);border:1px solid rgba(124,111,255,0.2);border-radius:8px;padding:12px 16px;margin-bottom:16px;"><p style="color:#a78bfa;font-size:13px;margin:0;">📍 ${extra.trackingNote}</p></div>` : ''}
      ${btn('View Order Details', `${process.env.CLIENT_URL}/orders/${orderId}`)}
    `),
  });
};

// ─── New Message → Seller ──────────────────────────────────
const sendNewMessageEmail = async (to, sellerName, senderName, productName, messageText) => {
  await transporter.sendMail({
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: `💬 New Message from ${senderName}`,
    html: baseHtml(`
      <h2 style="color:white;margin:0 0 6px;font-size:18px;">💬 New Customer Message</h2>
      <p style="color:#8b8fa8;font-size:13px;margin:0 0 20px;">Hi ${sellerName}, a customer sent you a message.</p>
      <table style="width:100%;border-collapse:collapse;background:#16162a;border-radius:10px;overflow:hidden;margin-bottom:16px;">
        ${infoRow('From', senderName)}
        ${productName ? infoRow('About Product', productName) : ''}
      </table>
      <div style="background:#1a1a2e;border-left:3px solid #7c6fff;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="color:#8b8fa8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Message</p>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.7;margin:0;">"${messageText}"</p>
      </div>
      ${btn('View in Dashboard', `${process.env.CLIENT_URL}/seller`)}
    `),
  });
};

// ─── New Seller Registration → Admin ──────────────────────
const sendNewSellerRegistrationEmail = async (seller) => {
  await transporter.sendMail({
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `🆕 New Seller Application — ${seller.name}`,
    html: baseHtml(`
      <h2 style="color:white;margin:0 0 6px;font-size:18px;">🆕 New Seller Application</h2>
      <p style="color:#8b8fa8;font-size:13px;margin:0 0 20px;">A new seller has applied and is waiting for your review.</p>
      <table style="width:100%;border-collapse:collapse;background:#16162a;border-radius:10px;overflow:hidden;margin-bottom:16px;">
        ${infoRow('Name', seller.name)}
        ${infoRow('Email', seller.email)}
        ${infoRow('Business', seller.sellerInfo?.businessName || '—')}
        ${infoRow('Type', seller.sellerInfo?.businessType?.replace(/_/g, ' ') || '—')}
        ${infoRow('Phone', seller.sellerInfo?.phone || '—')}
        ${infoRow('CNIC', seller.sellerInfo?.cnic || '—')}
        ${infoRow('License', seller.sellerInfo?.licenseNumber || '—')}
      </table>
      ${btn('Review Application', `${process.env.CLIENT_URL}/admin`)}
    `),
  });
};

// ─── Payment Received → Customer ──────────────────────────
const sendPaymentConfirmationEmail = async (to, name, amount, orderId) => {
  const shortId = String(orderId).slice(-8).toUpperCase();
  await transporter.sendMail({
    from: `"SoleStore" <${process.env.GMAIL_USER}>`,
    to,
    subject: `💳 Payment Confirmed — $${amount.toFixed(2)}`,
    html: baseHtml(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:8px;">💳</div>
        <h2 style="color:white;margin:0;font-size:20px;">Payment Successful!</h2>
        <p style="color:#8b8fa8;margin:6px 0 0;font-size:14px;">Hi ${name}</p>
      </div>
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
        <p style="color:#8b8fa8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Amount Paid</p>
        <p style="color:#34d399;font-size:36px;font-weight:900;margin:0;">$${amount.toFixed(2)}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#16162a;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        ${infoRow('Order ID', `#${shortId}`)}
        ${infoRow('Status', '✅ Paid')}
        ${infoRow('Method', 'Credit / Debit Card')}
      </table>
      ${btn('View Order', `${process.env.CLIENT_URL}/orders/${orderId}`)}
    `),
  });
};

module.exports = {
  sendOTPEmail,
  sendSellerStatusEmail,
  sendOrderConfirmationEmail,
  sendSellerOrderEmail,
  sendAdminOrderEmail,
  sendOrderStatusEmail,
  sendNewMessageEmail,
  sendNewSellerRegistrationEmail,
  sendPaymentConfirmationEmail,
};
