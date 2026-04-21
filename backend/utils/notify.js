const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const notify = async (userId, { title, message, type = 'system', icon = '🔔', link = '' }) => {
  try {
    await Notification.create({ user: userId, title, message, type, icon, link });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = notify;
