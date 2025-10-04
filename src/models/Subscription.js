const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    required: true,
    enum: ['Free', 'Basic', 'Premium']
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  paymentId: String,
  paymentProvider: String,
  features: [{
    name: String,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

// Methods
subscriptionSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  if (this.endDate && new Date() > this.endDate) {
    this.status = 'expired';
    this.save();
    return false;
  }
  return true;
};

subscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.updatedAt = Date.now();
  return this.save();
};

// Static methods
subscriptionSchema.statics.getActiveSubscriptions = function() {
  return this.find({
    status: 'active',
    $or: [
      { endDate: { $gte: new Date() } },
      { endDate: null }
    ]
  });
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
