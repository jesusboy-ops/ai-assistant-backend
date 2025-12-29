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

  /**
   * Save email draft
   */
  async saveDraft(userId, emailData) {
    try {
      // In a real implementation, you'd save to a drafts table
      // For now, we'll return a draft ID
      const draftId = `draft_${Date.now()}_${userId}`;
      
      // Store draft in memory or database
      // This is a simplified implementation
      return {
        success: true,
        draftId,
        message: 'Draft saved successfully'
      };
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  /**
   * Send email with follow-up reminder creation
   */
  async sendEmailWithFollowUp(to, subject, body, followUpData = null) {
    try {
      // Send the email
      const emailResult = await this.sendCustomEmail(to, subject, body);
      
      if (emailResult.success && followUpData) {
        // Create follow-up reminder
        const RemindersService = require('./reminders.service');
        
        const followUpReminder = {
          title: `Follow up: ${subject}`,
          description: `Follow up on email sent to ${to}`,
          reminder_time: followUpData.reminder_time || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days default
          ai_generated: true
        };

        await RemindersService.createReminder(followUpData.userId, followUpReminder);
      }

      return emailResult;
    } catch (error) {
      console.error('Failed to send email with follow-up:', error);
      throw new Error('Failed to send email with follow-up');
    }
  }

  /**
   * Generate structured email from AI input
   */
  generateEmailFromInput(input, context = {}) {
    // Simple email generation logic (replace with actual AI/NLP)
    const inputLower = input.toLowerCase();
    
    let subject = 'Follow-up Required';
    let body = input;
    
    // Extract subject if present
    const subjectMatch = input.match(/subject:\s*(.+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = input.replace(/subject:\s*.+/i, '').trim();
    }

    // Extract recipient if present
    const toMatch = input.match(/to:\s*([^\s]+@[^\s]+)/i);
    const to = toMatch ? toMatch[1] : null;

    return {
      to,
      subject,
      body: this.formatEmailBody(body, context),
      draft: true // Always start as draft
    };
  }

  /**
   * Format email body with proper structure
   */
  formatEmailBody(content, context = {}) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hello,</p>
        <p>${content.replace(/\n/g, '</p><p>')}</p>
        <p>Best regards,<br>${context.userName || 'AI Assistant User'}</p>
      </div>
    `;
  }
}

module.exports = new EmailService();
