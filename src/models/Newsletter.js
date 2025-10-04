const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  targetSubscribers: {
    type: String,
    enum: ['all', 'free', 'paid'],
    default: 'all'
  },
  category: {
    type: String,
    enum: ['sql-basics', 'advanced-queries', 'database-design', 'interview-tips', 'practice-problems'],
    default: 'sql-basics'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  scheduledFor: Date,
  sentAt: Date,
  sentTo: {
    count: {
      type: Number,
      default: 0
    },
    emails: [String]
  },
  analytics: {
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
newsletterSchema.index({ status: 1, scheduledFor: 1 });
newsletterSchema.index({ targetSubscribers: 1 });
newsletterSchema.index({ category: 1 });
newsletterSchema.index({ createdAt: -1 });

// Methods
newsletterSchema.methods.markAsSent = function(recipientCount, recipientEmails = []) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.sentTo.count = recipientCount;
  this.sentTo.emails = recipientEmails;
  this.updatedAt = Date.now();
  return this.save();
};

newsletterSchema.methods.updateAnalytics = function(type, increment = 1) {
  if (this.analytics[type] !== undefined) {
    this.analytics[type] += increment;
    this.updatedAt = Date.now();
    return this.save();
  }
};

// Static methods
newsletterSchema.statics.getScheduledNewsletters = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  });
};

newsletterSchema.statics.getRecentNewsletters = function(limit = 10) {
  return this.find({ status: 'sent' })
    .sort({ sentAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
