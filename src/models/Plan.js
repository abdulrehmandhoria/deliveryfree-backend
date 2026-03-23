const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A plan must have a name'],
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'A plan must have a price'],
  },
  features: {
    type: [String],
    default: [],
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
