const uploadService = require('../services/upload.service');

class UploadController {
  /**
   * Upload file
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      const { provider, folder } = req.body;

      const result = await uploadService.uploadFile(req.file, userId, {
        provider: provider || 'supabase',
        folder: folder || 'uploads'
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user files
   */
  async getFiles(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit } = req.query;

      const files = await uploadService.getUserFiles(userId, limit ? parseInt(limit) : 50);
      res.json({ files });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await uploadService.deleteFile(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
