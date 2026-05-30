import { getCloudinary } from '../config/cloudinary.js';
import { Question } from '../models/Question.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Prefix gốc bao phủ CẢ 2 cấu trúc folder upload trong Cloudinary:
//   - Single admin upload: toeic-ai/uploads/audio|images/*
//   - Bulk test upload   : toeic-ai/audio|images/ets-2026/test-XX/*
// (resource_type=video lọc ra audio, resource_type=image lọc ra ảnh)
const ALL_MEDIA_PREFIX = 'toeic-ai';

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
        // asset_folder ép bằng folder — Cloudinary Dynamic Folders mode
        // sẽ hiện đúng file trong folder browser thay vì ẩn.
        asset_folder: folder,
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

  /**
   * Liệt kê media từ Cloudinary, kèm số lần được Question reference.
   *
   * @param {Object} opts
   * @param {'audio'|'image'|'all'} [opts.type='all']
   * @param {number} [opts.maxResults=500] - cap để tránh fetch lố (Cloudinary max 500/request)
   * @returns {Promise<{ items: Array, totalAudio: number, totalImage: number }>}
   */
  async listResources({ type = 'all', maxResults = 500 } = {}) {
    const cld = getCloudinary();
    if (!cld) throw ApiError.internal('Cloudinary chưa được cấu hình');

    const tasks = [];
    if (type === 'audio' || type === 'all') {
      tasks.push(
        cld.api
          .resources({
            type: 'upload',
            resource_type: 'video', // Cloudinary lumps audio under 'video'
            prefix: ALL_MEDIA_PREFIX,
            max_results: maxResults,
          })
          .then((r) => ({ kind: 'audio', resources: r.resources || [] }))
          .catch((err) => {
            // Folder rỗng → Cloudinary KHÔNG throw 404, nhưng nếu key sai
            // hoặc network lỗi mới throw. Log để debug, return empty.
            logger.warn('Cloudinary audio list failed', { err: err.message });
            return { kind: 'audio', resources: [] };
          }),
      );
    }
    if (type === 'image' || type === 'all') {
      tasks.push(
        cld.api
          .resources({
            type: 'upload',
            resource_type: 'image',
            prefix: ALL_MEDIA_PREFIX,
            max_results: maxResults,
          })
          .then((r) => ({ kind: 'image', resources: r.resources || [] }))
          .catch((err) => {
            logger.warn('Cloudinary image list failed', { err: err.message });
            return { kind: 'image', resources: [] };
          }),
      );
    }

    const results = await Promise.all(tasks);
    const audioResources = results.find((r) => r.kind === 'audio')?.resources || [];
    const imageResources = results.find((r) => r.kind === 'image')?.resources || [];

    // Map về shape gọn cho FE
    const items = [
      ...audioResources.map((r) => mapResource(r, 'audio')),
      ...imageResources.map((r) => mapResource(r, 'image')),
    ];

    // Tính usage: 1 query Question, lọc media URL trùng với từng URL
    // (matching theo secure_url chính xác — Question.content.audioUrl/imageUrl).
    if (items.length > 0) {
      const allUrls = items.map((it) => it.url);
      // Tìm question có audioUrl hoặc imageUrl thuộc list này.
      const matches = await Question.find({
        $or: [
          { 'content.audioUrl': { $in: allUrls } },
          { 'content.imageUrl': { $in: allUrls } },
        ],
      })
        .select('content.audioUrl content.imageUrl')
        .lean();

      // Build count map theo URL.
      const counts = new Map();
      matches.forEach((q) => {
        if (q.content?.audioUrl) {
          counts.set(q.content.audioUrl, (counts.get(q.content.audioUrl) || 0) + 1);
        }
        // imageUrl có thể là chuỗi nhiều URL phân cách `;` (Part 7 multi-passage)
        // → tách ra để đếm đúng.
        const imgRaw = q.content?.imageUrl;
        if (imgRaw) {
          imgRaw.split(';').forEach((u) => {
            const trimmed = u.trim();
            if (trimmed) counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
          });
        }
      });

      items.forEach((it) => {
        it.usageCount = counts.get(it.url) || 0;
      });
    }

    return {
      items,
      totalAudio: audioResources.length,
      totalImage: imageResources.length,
    };
  },

  /**
   * Xóa media. Defense: nếu đang được Question reference → reject với
   * usage count để admin biết phải gỡ ở đề/câu hỏi trước.
   *
   * @param {Object} opts
   * @param {string} opts.publicId
   * @param {'audio'|'image'} opts.resourceType
   */
  async deleteResource({ publicId, resourceType }) {
    const cld = getCloudinary();
    if (!cld) throw ApiError.internal('Cloudinary chưa được cấu hình');
    if (!publicId) throw ApiError.badRequest('Thiếu publicId');
    if (!['audio', 'image'].includes(resourceType)) {
      throw ApiError.badRequest('resourceType phải là audio hoặc image');
    }

    // Build URL chuẩn để check usage (Cloudinary secure_url format).
    // Lấy info trước để biết URL chính xác.
    const cldResourceType = resourceType === 'audio' ? 'video' : 'image';
    let info;
    try {
      info = await cld.api.resource(publicId, { resource_type: cldResourceType });
    } catch (err) {
      if (err?.http_code === 404 || err?.error?.http_code === 404) {
        throw ApiError.notFound('Media không tồn tại hoặc đã bị xóa');
      }
      throw err;
    }
    const url = info.secure_url;

    // Đếm số Question đang dùng URL này (audioUrl hoặc imageUrl)
    // imageUrl có thể chứa nhiều URL phân cách `;` → dùng regex match.
    const usageCount = await Question.countDocuments({
      $or: [
        { 'content.audioUrl': url },
        { 'content.imageUrl': { $regex: escapeRegex(url) } },
      ],
    });

    if (usageCount > 0) {
      throw ApiError.conflict(
        `Media đang được dùng ở ${usageCount} câu hỏi. Vui lòng gỡ khỏi câu hỏi trước khi xóa.`,
      );
    }

    try {
      await cld.uploader.destroy(publicId, { resource_type: cldResourceType });
      logger.info('Media deleted', { publicId, resourceType });
      return { deleted: true, publicId };
    } catch (err) {
      logger.error('Cloudinary destroy failed', { publicId, err: err.message });
      throw ApiError.internal('Xóa media thất bại. Vui lòng thử lại.');
    }
  },
};

function mapResource(r, kind) {
  // Tên file để hiển thị — lấy phần cuối public_id + ghép extension từ format
  // (bulk upload strip extension trong publicId, single upload có timestamp suffix
  // nhưng cũng không kèm extension).
  const baseName = r.public_id.split('/').pop();
  const filename = r.format ? `${baseName}.${r.format}` : baseName;
  return {
    publicId: r.public_id,
    url: r.secure_url,
    bytes: r.bytes,
    format: r.format,
    resourceType: kind, // 'audio' | 'image' (gọn hơn 'video' của Cloudinary)
    width: r.width || null,
    height: r.height || null,
    duration: r.duration || null, // chỉ audio/video có
    createdAt: r.created_at,
    filename,
    folder: r.public_id.includes('/uploads/') ? 'single' : 'bulk',
    usageCount: 0, // populated sau
  };
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
