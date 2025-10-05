const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SENDGRID_USER || 'apikey', // usually 'apikey' for SendGrid
      pass: process.env.SENDGRID_PASS // your SendGrid API key
    }
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `SQL Newsletter <${process.env.SENDGRID_FROM_EMAIL || 'rehoser971@bllibl.com'}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: htmlContent
    };

    console.log(`Sending email to: ${mailOptions.to} with subject: ${mailOptions.subject}`);

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

module.exports = {
  createTransporter,
  sendEmail
};