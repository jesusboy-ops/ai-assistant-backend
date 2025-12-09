const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const uploadService = require('../services/upload.service');

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const { user } = req;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        email_verified: user.email_verified,
        created_at: user.created_at
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      const updates = {};
      if (name) updates.name = name;
      if (email && email !== req.user.email) {
        // Check if email already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updates.email = email;
        updates.email_verified = false;
      }

      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile_picture: user.profile_picture,
          email_verified: user.email_verified
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;

      // Upload to storage
      const result = await uploadService.uploadFile(req.file, userId, {
        provider: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'supabase',
        folder: 'profile-pictures'
      });

      // Update user profile
      const { data: user, error } = await supabase
        .from('users')
        .update({ profile_picture: result.url })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        message: 'Profile picture updated',
        profile_picture: result.url
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user with password
      const { data: user } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single();

      if (!user.password) {
        return res.status(400).json({ error: 'Cannot change password for OAuth users' });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', userId);

      if (error) throw error;

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      // Delete user data (cascade will handle related records)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
