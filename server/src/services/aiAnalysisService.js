import { AIAnalysis } from '../models/AIAnalysis.js';
import { Result } from '../models/Result.js';
import { env } from '../config/env.js';

const PART_NAMES = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Đoạn hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn',
  7: 'Part 7 — Đọc hiểu',
};

const PART_TIPS = {
  1: 'Luyện nghe miêu tả tranh: tập trung động từ ở thì hiện tại tiếp diễn, vị trí và hành động.',
  2: 'Luyện phản xạ Hỏi-Đáp: chú ý từ để hỏi (WH/Yes-No) và bẫy đồng âm.',
  3: 'Luyện nghe hội thoại: đọc trước câu hỏi, dự đoán chủ đề, ghi chú nhanh tên/số liệu.',
  4: 'Luyện nghe bài nói ngắn: nhận diện cấu trúc thông báo/quảng cáo, từ khóa nghề nghiệp.',
  5: 'Luyện ngữ pháp + từ vựng cơ bản: thì, giới từ, liên từ, word form.',
  6: 'Luyện điền từ vào đoạn: chú ý logic mạch văn, từ nối, thì.',
  7: 'Luyện đọc hiểu: kỹ năng skim/scan, paraphrase, suy luận; tăng tốc đọc.',
};

function buildHeuristicAnalysis(result) {
  const parts = Object.entries(result.partBreakdown || {})
    .filter(([, v]) => v && v.total > 0)
    .map(([key, v]) => ({
      part: Number(key.replace('part', '')),
      correct: v.correct,
      total: v.total,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.part - b.part);

  const strengths = parts
    .filter((p) => p.accuracy >= 80)
    .map((p) => `${PART_NAMES[p.part]}: làm đúng ${p.correct}/${p.total} (${p.accuracy}%).`);

  const weaknesses = parts
    .filter((p) => p.accuracy < 60)
    .map((p) => `${PART_NAMES[p.part]}: chỉ đúng ${p.correct}/${p.total} (${p.accuracy}%).`);

  // Recommendations: prioritize weakest parts
  const sortedByAccuracy = [...parts].sort((a, b) => a.accuracy - b.accuracy);
  const recommendations = sortedByAccuracy.slice(0, 3).map((p, idx) => ({
    topic: PART_NAMES[p.part],
    action: PART_TIPS[p.part] || 'Luyện tập thêm phần này.',
    priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
  }));

  // Estimate weeks to target 800 based on current scoreTotal
  let estimatedTargetWeeks = 0;
  if (result.testType === 'full') {
    const gap = Math.max(0, 800 - (result.scoreTotal || 0));
    estimatedTargetWeeks = Math.min(16, Math.max(4, Math.ceil(gap / 60)));
  }

  return {
    strengths: strengths.length > 0 ? strengths : ['Cần làm thêm bài để xác định điểm mạnh.'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Không có Part nào dưới 60% — duy trì phong độ.'],
    recommendations,
    estimatedTargetWeeks,
  };
}

/**
 * TODO: implement real OpenAI call when key is wired.
 * For now, returns null to signal fallback.
 */
async function callOpenAI(_result) {
  if (!env.OPENAI_API_KEY) return null;
  // Placeholder — real integration adds OpenAI SDK call here.
  // Returning null causes heuristic fallback.
  return null;
}

export const aiAnalysisService = {
  /**
   * Generate (or refresh) analysis for a full-test result.
   * Idempotent: if analysis exists, returns existing record.
   * Safe to call without awaiting — errors are caught and logged.
   *
   * @param {string} resultId
   * @returns {Promise<Object|null>} AIAnalysis plain object, or null on failure
   */
  async generateForResult(resultId) {
    try {
      const result = await Result.findById(resultId).lean();
      if (!result) return null;
      if (result.testType !== 'full') return null; // Only full tests get AI analysis

      const existing = await AIAnalysis.findOne({ resultId }).lean();
      if (existing) return existing;

      const aiResponse = await callOpenAI(result);
      const isFallback = !aiResponse;
      const payload = aiResponse || buildHeuristicAnalysis(result);

      const doc = await AIAnalysis.create({
        resultId,
        userId: result.userId,
        model: isFallback ? 'heuristic-v1' : env.OPENAI_MODEL,
        promptVersion: 'v1.0',
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        recommendations: payload.recommendations,
        estimatedTargetWeeks: payload.estimatedTargetWeeks,
        rawResponse: isFallback ? '' : JSON.stringify(aiResponse),
        tokensUsed: 0,
        isFallback,
      });

      return doc.toObject();
    } catch (err) {
      console.error(`[aiAnalysisService] generateForResult failed for ${resultId}:`, err.message);
      return null;
    }
  },

  /**
   * Get existing analysis for a result. Does NOT generate.
   */
  async getByResultId(resultId) {
    return AIAnalysis.findOne({ resultId }).lean();
  },
};
