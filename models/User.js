const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'past_due', 'cancelled', 'inactive'],
      default: 'inactive'
    },
    planId: String,
    planName: String,
    monthlyLimit: Number,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    features: [String],
    cancelledAt: Date
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
