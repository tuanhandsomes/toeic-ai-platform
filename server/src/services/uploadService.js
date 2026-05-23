import { getCloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Upload binary buffer to Cloudinary using the upload_stream API.
 * Cloudinary SDK doesn't accept Buffer directly for uploader.upload(),
 * but upload_stream() does — we wrap it in a Promise for async/await.
 *
 * @param {Buffer} buffer
 * @param {Object} options - { folder, resourceType: 'image'|'video', filename }
 * @returns {Promise<{ url, publicId, bytes, format, resourceType }>}
 */
function uploadBuffer(cld, buffer, { folder, resourceType, filename }) {
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        // Generate public_id from original filename (without extension) +
        // timestamp suffix to avoid collisions if admin uploads same name twice
        public_id: filename
          ? `${filename.replace(/\.[^.]+$/, '')}_${Date.now()}`
          : undefined,
        use_filename: false,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
        });
      },
    );
    stream.end(buffer);
  });
}

export const uploadService = {
  /**
   * Upload an audio file (mp3/wav/m4a/ogg) to Cloudinary under
   * `toeic-ai/uploads/audio/`. Returns the secure CDN URL.
   */
  async uploadAudio(file) {
    const cld = getCloudinary();
    if (!cld) throw ApiError.internal('Cloudinary chưa được cấu hình');

    try {
      const result = await uploadBuffer(cld, file.buffer, {
        folder: 'toeic-ai/uploads/audio',
        resourceType: 'video', // Cloudinary lumps audio under 'video' resource type
        filename: file.originalname,
      });
      logger.info('Audio uploaded', { url: result.url, bytes: result.bytes });
      return result;
    } catch (err) {
      logger.error('Audio upload failed', { err: err.message });
      throw ApiError.internal('Upload audio thất bại. Vui lòng thử lại.');
    }
  },

  /**
   * Upload an image (jpg/png/webp) to Cloudinary under
   * `toeic-ai/uploads/images/`.
   */
  async uploadImage(file) {
    const cld = getCloudinary();
    if (!cld) throw ApiError.internal('Cloudinary chưa được cấu hình');

    try {
      const result = await uploadBuffer(cld, file.buffer, {
        folder: 'toeic-ai/uploads/images',
        resourceType: 'image',
        filename: file.originalname,
      });
      logger.info('Image uploaded', { url: result.url, bytes: result.bytes });
      return result;
    } catch (err) {
      logger.error('Image upload failed', { err: err.message });
      throw ApiError.internal('Upload ảnh thất bại. Vui lòng thử lại.');
    }
  },
};
