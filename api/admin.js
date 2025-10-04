const express = require('express');
const router = express.Router();
const User = require('../src/models/User');
const Newsletter = require('../src/models/Newsletter');
const Analytics = require('../src/models/Analytics');
const Subscription = require('../src/models/Subscription');
const { sendEmail } = require('../src/config/email');

// Simple auth middleware (in production, use proper JWT)
const adminAuth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || authorization !== `Bearer ${process.env.ADMIN_SECRET || 'admin123'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const freeUsers = await User.countDocuments({ subscriptionType: 'free', isActive: true });
    const paidUsers = await User.countDocuments({ subscriptionType: 'paid', isActive: true });

    const totalNewsletters = await Newsletter.countDocuments();
    const sentNewsletters = await Newsletter.countDocuments({ status: 'sent' });

    // Recent activity
    const recentSignups = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email name subscriptionType createdAt');

    // Email stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emailStats = await Analytics.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0
    };

    emailStats.forEach(stat => {
      if (stats[stat._id] !== undefined) {
        stats[stat._id] = stat.count;
      }
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        free: freeUsers,
        paid: paidUsers
      },
      newsletters: {
        total: totalNewsletters,
        sent: sentNewsletters
      },
      emailStats: stats,
      recentSignups
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-passwordHash -verificationToken');

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create newsletter
router.post('/newsletter', adminAuth, async (req, res) => {
  try {
    const {
      title,
      content,
      htmlContent,
      targetSubscribers = 'all',
      category = 'sql-basics',
      tags = [],
      scheduledFor
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newsletter = new Newsletter({
      title,
      content,
      htmlContent: htmlContent || `<div>${content.replace(/\n/g, '<br>')}</div>`,

      excerpt: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      targetSubscribers,
      category,
      tags,
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    });

    await newsletter.save();

    res.status(201).json({
      message: 'Newsletter created successfully',
      newsletter
    });

  } catch (error) {
    console.error('Newsletter creation error:', error);
    res.status(500).json({ error: 'Failed to create newsletter' });
  }
});

// Send newsletter
router.post('/newsletter/:id/send', adminAuth, async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.status === 'sent') {
      return res.status(400).json({ error: 'Newsletter already sent' });
    }

    // Get target users
    let query = { isActive: true };
    if (newsletter.targetSubscribers !== 'all') {
      query.subscriptionType = newsletter.targetSubscribers;
    }

    const users = await User.find(query).select('email name');

    if (users.length === 0) {
      return res.status(400).json({ error: 'No users found for target audience' });
    }

    // Send emails (in chunks to avoid rate limits)
    const chunkSize = 50;
    const emailChunks = [];

    for (let i = 0; i < users.length; i += chunkSize) {
      emailChunks.push(users.slice(i, i + chunkSize));
    }

    let sentCount = 0;
    const recipientEmails = [];

    for (const chunk of emailChunks) {
      const emailPromises = chunk.map(async (user) => {
        try {
          const personalizedContent = newsletter.htmlContent.replace('{{name}}', user.name || 'there');

          await sendEmail(
            user.email,
            newsletter.title,
            personalizedContent
          );

          // Track analytics
          const analytics = new Analytics({
            userId: user._id,
            newsletterId: newsletter._id,
            eventType: 'sent'
          });
          await analytics.save();

          recipientEmails.push(user.email);
          return { success: true, email: user.email };
        } catch (error) {
          console.error(`Failed to send to ${user.email}:`, error);
          return { success: false, email: user.email, error: error.message };
        }
      });

      const results = await Promise.allSettled(emailPromises);
      sentCount += results.filter(r => r.value?.success).length;

      // Small delay between chunks
      if (emailChunks.indexOf(chunk) < emailChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update newsletter status
    await newsletter.markAsSent(sentCount, recipientEmails);

    res.json({
      message: `Newsletter sent to ${sentCount} recipients`,
      sent: sentCount,
      total: users.length
    });

  } catch (error) {
    console.error('Newsletter send error:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// Get newsletters
router.get('/newsletters', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const newsletters = await Newsletter.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments();

    res.json({
      newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Newsletters fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch newsletters' });
  }
});

module.exports = router;
