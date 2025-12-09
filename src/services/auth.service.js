const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const { generateToken, generateResetToken, generateVerificationToken, verifyToken } = require('../utils/jwt');
const emailService = require('./email.service');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Register new user
   */
  async register(email, password, name) {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          email,
          password: hashedPassword,
          name,
          email_verified: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate verification token
      const verificationToken = generateVerificationToken({ userId: user.id, email });

      // Send verification email
      await emailService.sendVerificationEmail(email, name, verificationToken);

      // Generate JWT
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: user.email_verified
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw new Error('Invalid credentials');
      }

      // Check if user registered with OAuth
      if (!user.password) {
        throw new Error('Please login with Google');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: user.email_verified,
          profile_picture: user.profile_picture
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Google OAuth login
   */
  async googleAuth(idToken) {
    try {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { email, name, picture, sub: googleId } = payload;

      // Check if user exists
      let { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!user) {
        // Create new user
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{
            email,
            name,
            profile_picture: picture,
            google_id: googleId,
            email_verified: true,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        user = newUser;
      }

      // Generate JWT
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: user.email_verified,
          profile_picture: user.profile_picture
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      // Find user
      const { data: user } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .single();

      if (!user) {
        // Don't reveal if user exists
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = generateResetToken({ userId: user.id, email });

      // Send reset email
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);

      return { message: 'Password reset email sent' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = verifyToken(token);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', decoded.userId);

      if (error) throw error;

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      // Verify token
      const decoded = verifyToken(token);

      // Update user
      const { error } = await supabase
        .from('users')
        .update({ email_verified: true })
        .eq('id', decoded.userId);

      if (error) throw error;

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }
}

module.exports = new AuthService();
