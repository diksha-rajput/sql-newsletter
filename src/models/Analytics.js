const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  newsletterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true
  },
  eventType: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'],
    required: true
  },
  eventData: {
    userAgent: String,
    ipAddress: String,
    clickedUrl: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  metadata: {
    device: String,
    browser: String,
    os: String,
    location: {
      country: String,
      city: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 365 // Expire after 1 year
  }
});

// Compound indexes for efficient queries
analyticsSchema.index({ newsletterId: 1, eventType: 1 });
analyticsSchema.index({ userId: 1, eventType: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ 'eventData.timestamp': -1 });

// Static methods for analytics aggregation
analyticsSchema.statics.getNewsletterStats = async function(newsletterId) {
  const pipeline = [
    { $match: { newsletterId: new mongoose.Types.ObjectId(newsletterId) } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ];

  const results = await this.aggregate(pipeline);
  const stats = {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0
  };

  results.forEach(result => {
    stats[result._id] = result.count;
  });

  return stats;
};

analyticsSchema.statics.getUserEngagement = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 });
};

analyticsSchema.statics.getOverallStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1, '_id.eventType': 1 } }
  ];

  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Analytics', analyticsSchema);
