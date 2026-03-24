const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['restaurant', 'rider', 'admin'],
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

messageSchema.index({ orderId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
