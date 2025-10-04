const nodemailer = require('nodemailer');
const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const Analytics = require('../models/Analytics');

class EmailService {
  constructor() {
    console.log('Initializing EmailService...');
    console.log('Using Gmail user:', process.env.GMAIL_USER);
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('ERROR: GMAIL_USER or GMAIL_APP_PASSWORD not set in environment variables');
    }
    this.transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    console.log('Nodemailer transporter created.');
  }

  async sendEmail(to, subject, htmlContent, trackingData = null) {
    try {
      console.log('-----');
      console.log(`Preparing to send email to: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`Subject: ${subject}`);

      if (trackingData) {
        console.log(`Adding tracking pixel for newsletterId: ${trackingData.newsletterId}, userId: ${trackingData.userId}`);
      }

      let finalHtmlContent = htmlContent;
      if (trackingData) {
        const trackingPixel = `<img src="${process.env.APP_URL || 'http://localhost:3001'}/api/analytics/track/open/${trackingData.newsletterId}/${trackingData.userId}" width="1" height="1" style="display:none;" />`;
        finalHtmlContent = htmlContent + trackingPixel;
      }

      const mailOptions = {
        from: `SQL Newsletter <${process.env.GMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: finalHtmlContent
      };

      console.log('Sending email with mailOptions:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transport.sendMail(mailOptions);
      console.log('Email sent successfully! Message ID:', result.messageId);
      console.log('-----\n');
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('!!!!! Email sending failed !!!!!');
      console.error(error);
      console.log('-----\n');
      return { success: false, error: error.message || error.toString() };
    }
  }

  async sendNewsletterToUsers(newsletter, users) {
    const results = { sent: 0, failed: 0, errors: [] };

    console.log(`Sending newsletter "${newsletter.title}" to ${users.length} users.`);

    const chunkSize = 50;
    const chunks = [];

    for (let i = 0; i < users.length; i += chunkSize) {
      chunks.push(users.slice(i, i + chunkSize));
    }

    for (const [index, chunk] of chunks.entries()) {
      console.log(`Sending emails batch ${index + 1} of ${chunks.length} (size: ${chunk.length})`);

      const emailPromises = chunk.map(async (user) => {
        try {
          let personalizedContent = newsletter.htmlContent;
          personalizedContent = personalizedContent.replace(/{{name}}/g, user.name || 'there');
          personalizedContent = personalizedContent.replace(/{{email}}/g, user.email);

          const unsubscribeLink = `${process.env.APP_URL || 'http://localhost:3001'}/unsubscribe?email=${encodeURIComponent(user.email)}`;
          personalizedContent += `
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              Don't want to receive these emails? 
              <a href="${unsubscribeLink}" style="color: #666;">Unsubscribe here</a>
            </p>
          `;

          const trackingData = {
            newsletterId: newsletter._id,
            userId: user._id
          };

          const result = await this.sendEmail(user.email, newsletter.title, personalizedContent, trackingData);

          if (result.success) {
            console.log(`Success: Email sent to ${user.email}`);
            await new Analytics({
              userId: user._id,
              newsletterId: newsletter._id,
              eventType: 'sent'
            }).save();
            results.sent++;
          } else {
            console.warn(`Failure: Email to ${user.email} failed with error: ${result.error}`);
            results.failed++;
            results.errors.push({ email: user.email, error: result.error });
          }
        } catch (error) {
          console.error(`Unexpected error sending email to ${user.email}:`, error.message || error.toString());
          results.failed++;
          results.errors.push({ email: user.email, error: error.message || error.toString() });
        }
      });

      await Promise.allSettled(emailPromises);

      if (index < chunks.length - 1) {
        console.log('Waiting for 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Finished sending newsletter. Total sent: ${results.sent}, Failed: ${results.failed}`);
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors);
    }
    console.log('-----\n');

    return results;
  }

  async sendWelcomeEmail(user) {
    console.log(`Sending welcome email to ${user.email}`);
    const welcomeContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SQL Newsletter!</h1>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for subscribing to our SQL interview preparation newsletter. 
            You're now part of a community of ${await User.countDocuments({ isActive: true })} developers 
            mastering SQL skills!
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What to expect:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>${user.subscriptionType === 'paid' ? 'Daily' : 'Weekly'} SQL tips and tricks</li>
              <li>Real interview questions from top tech companies</li>
              <li>Database design best practices</li>
              <li>Query optimization techniques</li>
              ${user.subscriptionType === 'paid' ? '<li>Exclusive premium content and advanced topics</li>' : ''}
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 20px;">Your subscription: <strong>${user.subscriptionType.toUpperCase()}</strong></p>
            ${user.subscriptionType === 'free' ? `
              <a href="${process.env.APP_URL || 'http://localhost:3001'}/subscribe" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Upgrade to Premium
              </a>
            ` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            Get ready to ace your next SQL interview! Your first newsletter will arrive soon.
          </p>
          <p style="color: #666;">
            Best regards,<br>
            <strong>The SQL Newsletter Team</strong>
          </p>
        </div>
        <div style="background: #f1f3f4; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} SQL Newsletter. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, 'Welcome to SQL Newsletter! 🎉', welcomeContent);
  }

  async sendTestEmail() {
    console.log('Sending test email...');
    const testContent = `
      <h2>Test Email</h2>
      <p>This is a test email from your SQL Newsletter platform.</p>
      <p>If you received this, your email configuration is working correctly!</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `;

    return this.sendEmail(
      process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      'SQL Newsletter - Test Email',
      testContent
    );
  }
}

module.exports = new EmailService();
