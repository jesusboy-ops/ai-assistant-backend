const { supabase } = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  /**
   * Upload file to Supabase Storage
   */
  async uploadToSupabase(file, userId, folder = 'uploads') {
    try {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}/${folder}/${uuidv4()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('files')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      return {
        url: urlData.publicUrl,
        path: fileName,
        size: file.size,
        mimetype: file.mimetype
      };
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadToCloudinary(file, userId, folder = 'ai-assistant') {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary not configured');
      }

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/${userId}`,
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
              });
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Upload file (auto-select provider)
   */
  async uploadFile(file, userId, options = {}) {
    try {
      const { provider = 'supabase', folder = 'uploads' } = options;

      let result;

      if (provider === 'cloudinary' && process.env.CLOUDINARY_CLOUD_NAME) {
        result = await this.uploadToCloudinary(file, userId, folder);
      } else {
        result = await this.uploadToSupabase(file, userId, folder);
      }

      // Save file metadata to database
      const { data: fileRecord, error } = await supabase
        .from('files')
        .insert([{
          user_id: userId,
          filename: file.originalname,
          url: result.url,
          size: file.size,
          mimetype: file.mimetype,
          provider: provider,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        ...result,
        id: fileRecord.id,
        filename: file.originalname
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Get user files
   */
  async getUserFiles(userId, limit = 50) {
    try {
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return files;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId) {
    try {
      // Get file info
      const { data: file } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from storage
      if (file.provider === 'supabase' && file.path) {
        await supabase.storage
          .from('files')
          .remove([file.path]);
      } else if (file.provider === 'cloudinary' && file.publicId) {
        await cloudinary.uploader.destroy(file.publicId);
      }

      // Delete from database
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

// Add uuid package requirement
const uuid = require('uuid');

module.exports = new UploadService();
