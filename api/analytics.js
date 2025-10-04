const express = require('express');
const router = express.Router();
const Analytics = require('../src/models/Analytics');
const User = require('../src/models/User');
const Newsletter = require('../src/models/Newsletter');

// Track email open
router.get('/track/open/:newsletterId/:userId', async (req, res) => {
  try {
    const { newsletterId, userId } = req.params;

    // Create analytics record
    const analytics = new Analytics({
      userId,
      newsletterId,
      eventType: 'opened',
      eventData: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        timestamp: new Date()
      }
    });

    await analytics.save();

    // Update newsletter analytics
    await Newsletter.findByIdAndUpdate(newsletterId, {
      $inc: { 'analytics.opened': 1 }
    });

    // Return 1x1 transparent pixel
    const pixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
      0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
      0x04, 0x01, 0x00, 0x3B
    ]);

    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pixel);

  } catch (error) {
    console.error('Open tracking error:', error);
    res.status(200).send(''); // Don't break email rendering
  }
});

// Track link clicks
router.get('/track/click/:newsletterId/:userId', async (req, res) => {
  try {
    const { newsletterId, userId } = req.params;
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Create analytics record
    const analytics = new Analytics({
      userId,
      newsletterId,
      eventType: 'clicked',
      eventData: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        clickedUrl: url,
        timestamp: new Date()
      }
    });

    await analytics.save();

    // Update newsletter analytics
    await Newsletter.findByIdAndUpdate(newsletterId, {
      $inc: { 'analytics.clicked': 1 }
    });

    // Redirect to actual URL
    res.redirect(decodeURIComponent(url));

  } catch (error) {
    console.error('Click tracking error:', error);
    res.redirect(req.query.url || '/');
  }
});

// Get analytics summary
router.get('/summary/:newsletterId', async (req, res) => {
  try {
    const { newsletterId } = req.params;

    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    const stats = await Analytics.getNewsletterStats(newsletterId);

    // Calculate rates
    const openRate = newsletter.sentTo.count > 0 ? 
      ((stats.opened / newsletter.sentTo.count) * 100).toFixed(2) : 0;
    const clickRate = stats.opened > 0 ? 
      ((stats.clicked / stats.opened) * 100).toFixed(2) : 0;

    res.json({
      newsletter: {
        id: newsletter._id,
        title: newsletter.title,
        sentAt: newsletter.sentAt,
        sentTo: newsletter.sentTo.count
      },
      stats,
      rates: {
        openRate: `${openRate}%`,
        clickRate: `${clickRate}%`
      }
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get overall analytics for admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get overall stats
    const overallStats = await Analytics.getOverallStats(days);

    // Get top performing newsletters
    const topNewsletters = await Newsletter.find({ status: 'sent' })
      .sort({ 'analytics.opened': -1 })
      .limit(5)
      .select('title analytics sentAt sentTo');

    // Get user engagement trends
    const engagementTrends = await Analytics.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
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

    res.json({
      overallStats,
      topNewsletters,
      engagementTrends
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

module.exports = router;
