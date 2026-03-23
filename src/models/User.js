const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['RESTAURANT', 'RIDER', 'ADMIN'],
    default: 'RESTAURANT',
  },
  isActivated: {
    type: Boolean,
    default: function() {
      return this.role === 'ADMIN'; // Admin is activated by default
    },
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  assignedRestaurants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  petrolAllowancePerOrder: {
    type: Number,
    default: 0,
  },
  earningsBalance: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;
