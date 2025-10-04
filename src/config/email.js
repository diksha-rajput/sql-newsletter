const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `SQL Newsletter <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createTransporter,
  sendEmail
};
