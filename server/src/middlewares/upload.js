import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

/**
 * Multer config — memory storage (file buffer never touches disk, gets piped
 * straight to Cloudinary). Per-field-type middleware factories with their
 * own MIME filter and size limit so audio doesn't accept .png and vice versa.
 *
 * Limits are generous for TOEIC content:
 *   Audio: 10 MB  — Part 3/4 hội thoại 30s @ 192kbps ≈ 750KB; biggest seen ~4MB
 *   Image: 5 MB   — Part 7 multi-passage scan ≈ 1-2MB
 */

// Project convention chỉ dùng MP3 + PNG (testMediaService regex `E26-TXX-NN.mp3`
// và `*.PNG` ràng buộc cứng). Chỉ allow đúng 2 format này để tránh false
// promise — admin upload WAV/JPG sẽ pass mimetype filter nhưng fail naming
// convention sau đó, gây confusion.
const ALLOWED_AUDIO = new Set([
  'audio/mpeg', // .mp3 chuẩn (RFC 3003)
  'audio/mp3',  // .mp3 fallback một số browser/OS gửi
]);

const ALLOWED_IMAGE = new Set([
  'image/png',
  'image/jpeg',
]);

const makeFilter = (allowed, kind) => (_req, file, cb) => {
  if (allowed.has(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest(`Định dạng file không hợp lệ cho ${kind}: ${file.mimetype}`));
};

export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: makeFilter(ALLOWED_AUDIO, 'audio'),
}).single('file');

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: makeFilter(ALLOWED_IMAGE, 'image'),
}).single('file');

const ALLOWED_TEST_MEDIA = new Set([...ALLOWED_AUDIO, ...ALLOWED_IMAGE]);

/**
 * Bulk upload for test media (audio + image mixed). Accepts up to 200 files
 * per request (a full test has ~92, so 200 leaves headroom for partial retries).
 * Per-file limit 10 MB (audio largest).
 */
export const uploadTestMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 200 },
  fileFilter: makeFilter(ALLOWED_TEST_MEDIA, 'media'),
}).array('files');

/**
 * Wrap multer middleware to convert its MulterError into ApiError so it flows
 * through our normal errorHandler. Default multer throws raw errors that the
 * Express error handler doesn't recognize.
 */
export function wrapMulter(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File vượt quá giới hạn kích thước cho phép'));
        }
        return next(ApiError.badRequest(`Lỗi upload: ${err.message}`));
      }
      // Already an ApiError from fileFilter, or unknown error
      return next(err);
    });
  };
}
