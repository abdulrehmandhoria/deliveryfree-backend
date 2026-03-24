const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  accuracy: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

locationSchema.index({ riderId: 1, createdAt: -1 });

module.exports = mongoose.model('Location', locationSchema);
