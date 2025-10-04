const Analytics = require('../models/Analytics');
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');

class AnalyticsService {
  async trackEvent(userId, newsletterId, eventType, eventData = {}) {
    try {
      const analytics = new Analytics({
        userId,
        newsletterId,
        eventType,
        eventData: {
          ...eventData,
          timestamp: new Date()
        }
      });

      await analytics.save();

      // Update newsletter analytics counter
      const updateField = `analytics.${eventType}`;
      await Newsletter.findByIdAndUpdate(newsletterId, {
        $inc: { [updateField]: 1 }
      });

      return analytics;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      throw error;
    }
  }

  async getNewsletterAnalytics(newsletterId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Get newsletter details
      const newsletter = await Newsletter.findById(newsletterId);
      if (!newsletter) {
        throw new Error('Newsletter not found');
      }

      // Get analytics data
      const analytics = await Analytics.find({
        newsletterId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      // Aggregate by event type
      const eventCounts = analytics.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {});

      // Calculate rates
      const sentCount = newsletter.sentTo?.count || 0;
      const openRate = sentCount > 0 ? ((eventCounts.opened || 0) / sentCount * 100).toFixed(2) : 0;
      const clickRate = eventCounts.opened > 0 ? ((eventCounts.clicked || 0) / eventCounts.opened * 100).toFixed(2) : 0;

      // Get engagement timeline
      const timeline = this.groupAnalyticsByDate(analytics);

      return {
        newsletter: {
          id: newsletter._id,
          title: newsletter.title,
          sentAt: newsletter.sentAt,
          sentTo: sentCount
        },
        eventCounts,
        rates: {
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`
        },
        timeline
      };
    } catch (error) {
      console.error('Newsletter analytics error:', error);
      throw error;
    }
  }

  async getUserEngagement(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const analytics = await Analytics.find({
        userId,
        createdAt: { $gte: startDate }
      }).populate('newsletterId', 'title sentAt').sort({ createdAt: -1 });

      const engagementScore = this.calculateEngagementScore(analytics);
      const activityTimeline = this.groupAnalyticsByDate(analytics);

      return {
        userId,
        analytics,
        engagementScore,
        activityTimeline
      };
    } catch (error) {
      console.error('User engagement error:', error);
      throw error;
    }
  }

  async getDashboardAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Overall stats
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const paidUsers = await User.countDocuments({ subscriptionType: 'paid', isActive: true });

      const totalNewsletters = await Newsletter.countDocuments();
      const sentNewsletters = await Newsletter.countDocuments({ status: 'sent' });

      // Email analytics
      const emailAnalytics = await Analytics.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 }
          }
        }
      ]);

      const emailStats = emailAnalytics.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 });

      // Engagement trends by date
      const engagementTrends = await Analytics.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            eventType: { $in: ['opened', 'clicked'] }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      // Top performing newsletters
      const topNewsletters = await Newsletter.find({ status: 'sent' })
        .sort({ 'analytics.opened': -1 })
        .limit(5)
        .select('title analytics sentAt sentTo');

      // Recent signups
      const recentSignups = await User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('email name subscriptionType createdAt');

      return {
        overview: {
          totalUsers,
          activeUsers,
          paidUsers,
          totalNewsletters,
          sentNewsletters,
          conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0
        },
        emailStats,
        engagementTrends,
        topNewsletters,
        recentSignups
      };
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      throw error;
    }
  }

  groupAnalyticsByDate(analytics) {
    return analytics.reduce((acc, event) => {
      const date = event.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { opened: 0, clicked: 0, bounced: 0 };
      }
      acc[date][event.eventType] = (acc[date][event.eventType] || 0) + 1;
      return acc;
    }, {});
  }

  calculateEngagementScore(analytics) {
    if (analytics.length === 0) return 0;

    const weights = {
      opened: 1,
      clicked: 3,
      bounced: -1
    };

    const score = analytics.reduce((total, event) => {
      const weight = weights[event.eventType] || 0;
      return total + weight;
    }, 0);

    return Math.max(0, Math.min(100, (score / analytics.length) * 10));
  }

  async getTopPerformingContent(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const topContent = await Newsletter.aggregate([
        {
          $match: {
            status: 'sent',
            sentAt: { $gte: startDate }
          }
        },
        {
          $addFields: {
            openRate: {
              $cond: [
                { $gt: ['$sentTo.count', 0] },
                { $multiply: [{ $divide: ['$analytics.opened', '$sentTo.count'] }, 100] },
                0
              ]
            },
            clickRate: {
              $cond: [
                { $gt: ['$analytics.opened', 0] },
                { $multiply: [{ $divide: ['$analytics.clicked', '$analytics.opened'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { openRate: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            title: 1,
            category: 1,
            sentAt: 1,
            'sentTo.count': 1,
            'analytics.opened': 1,
            'analytics.clicked': 1,
            openRate: { $round: ['$openRate', 2] },
            clickRate: { $round: ['$clickRate', 2] }
          }
        }
      ]);

      return topContent;
    } catch (error) {
      console.error('Top content error:', error);
      throw error;
    }
  }

  async generateAnalyticsReport(startDate, endDate) {
    try {
      const dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const [
        userGrowth,
        emailMetrics,
        contentPerformance,
        engagementMetrics
      ] = await Promise.all([
        User.aggregate([
          { $match: { createdAt: dateFilter.createdAt } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              newUsers: { $sum: 1 },
              paidUsers: { $sum: { $cond: [{ $eq: ['$subscriptionType', 'paid'] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Analytics.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: '$eventType',
              count: { $sum: 1 }
            }
          }
        ]),
        this.getTopPerformingContent((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
        Analytics.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              opens: { $sum: { $cond: [{ $eq: ['$eventType', 'opened'] }, 1, 0] } },
              clicks: { $sum: { $cond: [{ $eq: ['$eventType', 'clicked'] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      return {
        dateRange: { startDate, endDate },
        userGrowth,
        emailMetrics,
        contentPerformance,
        engagementMetrics
      };
    } catch (error) {
      console.error('Analytics report error:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
