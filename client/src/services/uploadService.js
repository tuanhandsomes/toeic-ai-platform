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
};
