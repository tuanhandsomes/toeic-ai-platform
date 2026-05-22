import { Result } from '../models/Result.js';
import { aiAnalysisService } from '../services/aiAnalysisService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verify the result exists AND belongs to the requesting user.
 * Returns the lean result doc so callers can read testType etc.
 */
async function loadOwnedResult(resultId, userId) {
  const result = await Result.findById(resultId).lean();
  if (!result) throw ApiError.notFound('Không tìm thấy kết quả');
  if (String(result.userId) !== String(userId)) {
    throw ApiError.forbidden('Bạn không có quyền truy cập kết quả này');
  }
  return result;
}

export const aiController = {
  /**
   * POST /ai/analyze/:resultId
   * Force-regenerate analysis — deletes existing then calls OpenAI fresh.
   * Rate-limited (aiLimiter: 5/hour/user).
   */
  analyze: asyncHandler(async (req, res) => {
    const result = await loadOwnedResult(req.params.resultId, req.user._id);

    if (result.testType !== 'full') {
      throw ApiError.badRequest('AI phân tích chỉ áp dụng cho Full Test');
    }

    const analysis = await aiAnalysisService.regenerateForResult(result._id);
    if (!analysis) {
      throw ApiError.internal('Không thể sinh phân tích AI. Vui lòng thử lại sau.');
    }

    res.json({ success: true, data: { analysis } });
  }),

  /**
   * GET /ai/analysis/:resultId
   * Returns existing analysis. If missing and result is full-test, lazy-generates one.
   */
  get: asyncHandler(async (req, res) => {
    const result = await loadOwnedResult(req.params.resultId, req.user._id);

    let analysis = await aiAnalysisService.getByResultId(result._id);

    // Lazy-generate only for full tests if missing (e.g. old results from before AI wire)
    if (!analysis && result.testType === 'full') {
      analysis = await aiAnalysisService.generateForResult(result._id);
    }

    if (!analysis) {
      throw ApiError.notFound('Chưa có phân tích AI cho kết quả này');
    }

    res.json({ success: true, data: { analysis } });
  }),
};
