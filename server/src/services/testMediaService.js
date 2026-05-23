import { getCloudinary } from '../config/cloudinary.js';
import { Question } from '../models/Question.js';
import { Test } from '../models/Test.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Bulk upload audio + image files for a specific test (admin-only).
 * Workflow per file:
 *   1. Validate filename against ETS naming convention.
 *   2. Compute the local URL that questions in DB are currently pointing at
 *      (e.g. /audio/ets-2026/test-02/E26-T02-01.mp3).
 *   3. Upload buffer to Cloudinary at a mirrored folder.
 *   4. Update every Question doc whose audioUrl or imageUrl matches the local
 *      URL, replacing it with the Cloudinary secure URL. Handles the
 *      semicolon-joined multi-passage imageUrl correctly.
 *
 * Returns a per-file report so the UI can show which ones succeeded.
 *
 * Why mirror folder structure?
 * - Idempotent re-uploads (same path → overwrite same Cloudinary asset)
 * - migrateToCloudinary.js can also re-upload safely
 * - Easy debugging in Cloudinary Media Library
 */

const AUDIO_EXT_REGEX = /\.(mp3|wav|m4a|ogg)$/i;
const IMAGE_EXT_REGEX = /\.(png|jpe?g|webp|gif)$/i;

// Strict filename patterns — anything else is rejected so we never upload junk.
//   audio:  E26-T02-01.mp3   or   E26-T02-32-34.mp3
//   image:  01.PNG | 06.PNG  (Part 1)
//           graphic-q62-64.PNG | passage-q131-134.PNG
//           passage-q176-180-a.PNG (multi)
const AUDIO_NAME_REGEX = /^E26-T(\d{2})-(\d{2})(?:-(\d{2,3}))?\.(mp3|wav|m4a|ogg)$/i;
const IMAGE_PART1_REGEX = /^(0[1-9]|10)\.(png|jpe?g|webp)$/i;
const IMAGE_PASSAGE_REGEX = /^(graphic|passage)-q\d+-\d+(-[a-c])?\.(png|jpe?g|webp)$/i;

function deriveTestCode(test) {
  const match = test.title?.match(/Test\s+(\d+)/i);
  if (!match) {
    throw ApiError.badRequest(
      `Không xác định được mã đề từ tên đề "${test.title}". Tên đề cần có dạng "... Test 02".`,
    );
  }
  return `T${match[1].padStart(2, '0')}`;
}

function testCodeToFolder(testCode) {
  return `test-${testCode.slice(1).padStart(2, '0')}`;
}

/**
 * Validate filename + compute the local URL it should match in Question docs.
 * Throws ApiError.badRequest on invalid name (caller catches and reports).
 */
function buildLocalUrl(filename, testCode, folder) {
  if (AUDIO_EXT_REGEX.test(filename)) {
    const m = AUDIO_NAME_REGEX.exec(filename);
    if (!m) {
      throw new Error(
        `Tên file âm thanh không đúng quy tắc. Phải có dạng E26-${testCode}-NN.mp3 hoặc E26-${testCode}-NN-MM.mp3`,
      );
    }
    if (m[1].toUpperCase() !== testCode.slice(1)) {
      throw new Error(
        `File này thuộc đề khác (mã ${m[1]}). Đề hiện tại là mã ${testCode.slice(1)}.`,
      );
    }
    return `/audio/ets-2026/${folder}/${filename}`;
  }
  if (IMAGE_EXT_REGEX.test(filename)) {
    if (!IMAGE_PART1_REGEX.test(filename) && !IMAGE_PASSAGE_REGEX.test(filename)) {
      throw new Error(
        'Tên file hình ảnh không đúng quy tắc. Phải có dạng 01.PNG (ảnh Part 1) hoặc graphic-qXX-YY.PNG / passage-qXX-YY.PNG (đoạn văn) / passage-qXX-YY-a.PNG (đoạn văn nhiều phần).',
      );
    }
    return `/images/ets-2026/${folder}/${filename}`;
  }
  throw new Error(`Định dạng file không hỗ trợ: ${filename}`);
}

function uploadBuffer(cld, buffer, { folder, resourceType, filename }) {
  return new Promise((resolve, reject) => {
    // Mirror local path structure so naming stays consistent across uploads
    const publicId = `toeic-ai/${folder}/${filename.replace(/\.[^.]+$/, '')}`;
    const stream = cld.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        use_filename: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Replace every Question (in this test only) whose audioUrl or imageUrl
 * matches the local URL — switch them to the Cloudinary URL.
 * Multi-passage imageUrl is semicolon-joined; we split, replace one segment,
 * and re-join.
 */
async function relinkQuestionUrls(questionIds, mapping) {
  if (mapping.size === 0) return 0;
  const questions = await Question.find({ _id: { $in: questionIds } })
    .select('_id content')
    .lean();

  let updated = 0;
  for (const q of questions) {
    const updates = {};
    const currentAudio = q.content?.audioUrl || '';
    const currentImage = q.content?.imageUrl || '';

    if (currentAudio && mapping.has(currentAudio)) {
      updates['content.audioUrl'] = mapping.get(currentAudio);
    }
    if (currentImage) {
      const parts = currentImage.split(';').map((s) => s.trim()).filter(Boolean);
      const newParts = parts.map((p) => mapping.get(p) || p);
      const next = newParts.join(';');
      if (next !== currentImage) updates['content.imageUrl'] = next;
    }
    if (Object.keys(updates).length > 0) {
      await Question.updateOne({ _id: q._id }, { $set: updates });
      updated += 1;
    }
  }
  return updated;
}

export const testMediaService = {
  /**
   * @param {string} testId
   * @param {Array<{ originalname, buffer, mimetype, size }>} files - from multer
   * @returns {Promise<{ uploaded, failed, linkedQuestions }>}
   */
  async uploadForTest(testId, files) {
    if (!Array.isArray(files) || files.length === 0) {
      throw ApiError.badRequest('Vui lòng chọn ít nhất 1 file để tải lên.');
    }
    const cld = getCloudinary();
    if (!cld) throw ApiError.internal('Hệ thống lưu trữ chưa được cấu hình.');

    const test = await Test.findById(testId).lean();
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi.');

    const testCode = deriveTestCode(test);
    const folder = testCodeToFolder(testCode);

    const uploadedReports = [];
    const failedReports = [];
    const mapping = new Map(); // localUrl → cloudUrl

    // Parallel upload với concurrency 5 — giống pattern script
    // scripts/migrateToCloudinary.js. Giảm 92 files: ~5 phút serial → ~1 phút.
    // Cloudinary free tier rate-limit ~10 req/s nên 5 song song an toàn.
    const CONCURRENCY = 5;

    const uploadOne = async (file) => {
      const filename = file.originalname;
      try {
        const localUrl = buildLocalUrl(filename, testCode, folder);
        const resourceType = AUDIO_EXT_REGEX.test(filename) ? 'video' : 'image';
        const cloudFolder = resourceType === 'video'
          ? `audio/ets-2026/${folder}`
          : `images/ets-2026/${folder}`;
        const result = await uploadBuffer(cld, file.buffer, {
          folder: cloudFolder,
          resourceType,
          filename,
        });
        mapping.set(localUrl, result.url);
        uploadedReports.push({
          filename,
          url: result.url,
          bytes: result.bytes,
        });
      } catch (err) {
        logger.warn('Test media upload: file failed', {
          filename,
          err: err.message,
        });
        failedReports.push({ filename, reason: err.message });
      }
    };

    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const chunk = files.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(uploadOne));
    }

    // Relink Question docs in this test only
    const linkedCount = await relinkQuestionUrls(test.questionIds, mapping);

    logger.info('Test media upload complete', {
      testId,
      uploaded: uploadedReports.length,
      failed: failedReports.length,
      linkedQuestions: linkedCount,
    });

    return {
      uploaded: uploadedReports,
      failed: failedReports,
      linkedQuestions: linkedCount,
    };
  },
};
