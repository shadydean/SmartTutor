const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const emailTemplates = {
  verifyEmail: (name, token) => ({
    subject: 'Verify Your Email - SmartTutor',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1976d2;">Welcome to SmartTutor!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with SmartTutor. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email/${token}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${process.env.FRONTEND_URL}/verify-email/${token}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  }),

  resetPassword: (name, token) => ({
    subject: 'Password Reset Request - SmartTutor',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1976d2;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Use the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password/${token}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${process.env.FRONTEND_URL}/reset-password/${token}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  bookingConfirmation: (studentName, tutorName, service, date, time) => ({
    subject: 'Booking Confirmation - SmartTutor',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1976d2;">Booking Confirmation</h2>
        <p>Hi ${studentName},</p>
        <p>Your session has been confirmed with the following details:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Tutor:</strong> ${tutorName}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        <p>You can view your booking details and join the session from your dashboard.</p>
      </div>
    `,
  }),

  bookingReminder: (name, service, date, time, meetingLink) => ({
    subject: 'Session Reminder - SmartTutor',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1976d2;">Session Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder for your upcoming session:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" 
             style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Join Session
          </a>
        </div>
      </div>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};
