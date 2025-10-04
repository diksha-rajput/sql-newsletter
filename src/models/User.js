const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String
  },
  subscriptionType: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    topics: [{
      type: String,
      enum: ['sql-basics', 'advanced-queries', 'database-design', 'interview-tips', 'practice-problems']
    }]
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Update subscription method
userSchema.methods.updateSubscription = function(type, duration = null) {
  this.subscriptionType = type;
  if (type === 'paid' && duration) {
    this.subscriptionEndDate = new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000); // duration in months
  }
  this.updatedAt = Date.now();
  return this.save();
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionType === 'free') return true;
  if (this.subscriptionType === 'paid') {
    return this.subscriptionEndDate ? new Date() < this.subscriptionEndDate : false;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
