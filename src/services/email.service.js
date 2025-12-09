const sgMail = require('../config/sendgrid');

class EmailService {
  /**
   * Send verification email
   */
  async sendVerificationEmail(to, name, token) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured, skipping email');
        return;
      }

      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

      const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject: 'Verify Your Email - AI Assistant',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${name}!</h2>
            <p>Thank you for registering with AI Assistant. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('Verification email sent to:', to);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error - email failure shouldn't block registration
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, name, token) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured, skipping email');
        return;
      }

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

      const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject: 'Reset Your Password - AI Assistant',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('Password reset email sent to:', to);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  /**
   * Send custom email via SendGrid
   */
  async sendCustomEmail(to, subject, body, from = null) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid not configured');
      }

      const msg = {
        to,
        from: from || process.env.EMAIL_FROM,
        subject,
        html: body
      };

      await sgMail.send(msg);
      console.log('Email sent to:', to);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }
}

module.exports = new EmailService();
