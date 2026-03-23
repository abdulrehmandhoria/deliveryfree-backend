const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Subscription must belong to a user'],
    unique: true
  },
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan',
    required: [true, 'Subscription must have a reference to a plan']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
    default: 'ACTIVE',
  },
  customPrice: {
    type: Number,
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Subscription must have an end date']
  },
  paymentReference: String,
  whatsappNotifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ restaurant: 1 });
subscriptionSchema.index({ status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
