const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    default: '+923000000000'
  },
  supportEmail: {
    type: String,
    default: 'support@deliverfree.com'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
