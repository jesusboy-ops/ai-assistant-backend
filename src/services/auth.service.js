const bcrypt = require('bcrypt');
const { supabase } = require('../config/supabase');
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
        const authError = new Error('Invalid credentials');
        authError.statusCode = 401;
        authError.code = 'INVALID_CREDENTIALS';
        throw authError;
      }

      // Check if user registered with OAuth
      if (!user.password) {
        const authError = new Error('Please login with Google');
        authError.statusCode = 401;
        authError.code = 'OAUTH_REQUIRED';
        throw authError;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        const authError = new Error('Invalid credentials');
        authError.statusCode = 401;
        authError.code = 'INVALID_CREDENTIALS';
        throw authError;
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
      // If it's already a properly formatted error, re-throw it
      if (error.statusCode) {
        throw error;
      }
      
      // Otherwise, wrap it as a server error
      const serverError = new Error('Authentication service error');
      serverError.statusCode = 500;
      serverError.code = 'AUTH_SERVICE_ERROR';
      serverError.originalError = error.message;
      throw serverError;
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
   * Google OAuth callback - handle authorization code
   */
  async googleOAuthCallback(code) {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await googleClient.getToken({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });

      // Set credentials and get user info
      googleClient.setCredentials(tokens);
      
      // Get user profile from Google
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
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
      } else {
        // Update existing user with Google info if not set
        const updates = {};
        if (!user.google_id) updates.google_id = googleId;
        if (!user.profile_picture && picture) updates.profile_picture = picture;
        if (!user.email_verified) updates.email_verified = true;

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id);
          
          user = { ...user, ...updates };
        }
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
      console.error('Google OAuth callback error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Generate Google OAuth URL
   */
  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      client_id: process.env.GOOGLE_CLIENT_ID
    });
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
