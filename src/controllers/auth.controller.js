const authService = require('../services/auth.service');

class AuthController {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth callback
   */
  async googleAuth(req, res, next) {
    try {
      const { idToken } = req.body;
      const result = await authService.googleAuth(idToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth callback - handle authorization code from redirect
   */
  async googleOAuthCallback(req, res, next) {
    try {
      const { code, error, state } = req.query;

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        return res.redirect(`${process.env.CLIENT_URL}/auth/error?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${process.env.CLIENT_URL}/auth/error?error=no_code`);
      }

      // Exchange code for tokens and get user info
      const result = await authService.googleOAuthCallback(code);

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error?error=auth_failed`);
    }
  }

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(req, res, next) {
    try {
      const authUrl = authService.getGoogleAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res, next) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
