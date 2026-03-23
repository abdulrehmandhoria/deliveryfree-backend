const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a restaurant'],
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  customerName: {
    type: String,
    required: [true, 'Please provide customer name'],
  },
  customerAddress: {
    type: String,
    required: [true, 'Please provide customer address'],
  },
  customerPhone: {
    type: String,
    required: [true, 'Please provide customer phone number'],
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  },
  assignmentType: {
    type: String,
    enum: ['MANUAL', 'AUTO', 'NONE'],
    default: 'NONE',
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ status: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ rider: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
