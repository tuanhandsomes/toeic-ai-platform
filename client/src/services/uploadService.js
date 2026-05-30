import axiosClient from './axiosClient.js';

/**
 * Upload audio/image to BE which forwards to Cloudinary.
 * BE endpoints: POST /upload/audio, /upload/image — admin only.
 *
 * Pass a File or Blob object (typically from <input type="file"> change event).
 * Returns the unwrapped data object: { url, publicId, bytes, format, resourceType }.
 */
function postFile(path, file) {
  const fd = new FormData();
  fd.append('file', file);
  return axiosClient.post(path, fd, {
    // Let the browser set the multipart boundary automatically
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export const uploadService = {
  uploadAudio(file) {
    return postFile('/upload/audio', file);
  },

  uploadImage(file) {
    return postFile('/upload/image', file);
  },

  /**
   * List media từ Cloudinary, kèm số lần Question reference.
   * @param {Object} [params] - { type: 'audio' | 'image' | 'all' }
   */
  list(params = {}) {
    return axiosClient.get('/upload', { params });
  },

  /**
   * Xóa 1 media. BE check usage trước — nếu đang dùng ở Question → 409.
   * @param {string} resourceType - 'audio' | 'image'
   * @param {string} publicId - vd "toeic-ai/uploads/audio/file_123"
   */
  remove(resourceType, publicId) {
    // KHÔNG encode "/" trong publicId — BE route param dùng wildcard.
    return axiosClient.delete(`/upload/${resourceType}/${publicId}`);
  },
};
