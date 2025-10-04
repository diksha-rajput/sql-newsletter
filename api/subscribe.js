const express = require('express');
const router = express.Router();
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');
const { sendEmail } = require('../src/config/email');

// Subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    const { email, name, preferences, subscriptionType = 'free' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    // Create new user
    user = new User({
      email: email.toLowerCase(),
      name,
      subscriptionType,
      preferences: preferences || {
        frequency: 'weekly',
        topics: ['sql-basics']
      },
      emailVerified: false,
      verificationToken: Math.random().toString(36).substr(2, 9)
    });

    await user.save();

    // Create subscription record
    const subscription = new Subscription({
      userId: user._id,
      planName: subscriptionType === 'paid' ? 'Premium' : 'Free',
      price: subscriptionType === 'paid' ? 9.99 : 0,
      status: 'active'
    });

    await subscription.save();

    // Send welcome email
    const welcomeEmail = `
      <h2>Welcome to SQL Newsletter!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for subscribing to our SQL interview preparation newsletter.</p>
      <p>You'll receive ${preferences?.frequency || 'weekly'} updates with:</p>
      <ul>
        <li>SQL interview questions and answers</li>
        <li>Database design tips</li>
        <li>Query optimization techniques</li>
        <li>Practice problems</li>
      </ul>
      <p>Your subscription: <strong>${subscriptionType.toUpperCase()}</strong></p>
      <p>Best regards,<br>SQL Newsletter Team</p>
    `;

    await sendEmail(
      email,
      'Welcome to SQL Newsletter!',
      welcomeEmail
    );

    res.status(201).json({
      message: 'Successfully subscribed!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscriptionType: user.subscriptionType,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false, updatedAt: Date.now() }
    );

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Update subscription status
    await Subscription.updateMany(
      { userId: user._id },
      { status: 'cancelled', updatedAt: Date.now() }
    );

    res.json({ message: 'Successfully unsubscribed' });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const { email, preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        preferences,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscription = await Subscription.findOne({ 
      userId: user._id,
      status: 'active'
    });

    res.json({
      user: {
        email: user.email,
        name: user.name,
        subscriptionType: user.subscriptionType,
        isActive: user.isActive,
        preferences: user.preferences
      },
      subscription: subscription || null
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

module.exports = router;
