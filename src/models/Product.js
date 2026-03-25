const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Product must belong to a restaurant'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ restaurant: 1, category: 1 });
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
