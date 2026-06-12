import { AIAnalysis } from '../models/AIAnalysis.js';
import { Result } from '../models/Result.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Test } from '../models/Test.js';
import { env } from '../config/env.js';
import { getOpenAIClient } from '../config/openai.js';
import { logger } from '../utils/logger.js';
import {
  ANALYSIS_JSON_SCHEMA,
  PROMPT_VERSION,
  buildAnalysisPrompt,
} from '../utils/prompts.js';

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

// Câu đầu tiên (toàn cục) của mỗi Part trong đề TOEIC 200 câu. Khớp với
// PART_OFFSETS ở client/src/constants/toeic.js — UI cũng đánh số câu theo
// thang 1-200 để khớp đề thi thật (Practice Part 7 hiển thị câu 147-200).
const PART_OFFSETS = { 1: 1, 2: 7, 3: 32, 4: 71, 5: 101, 6: 131, 7: 147 };

const MAX_WRONG_DETAILS = 25; // Cap câu sai chi tiết để giữ token budget
const STEM_SNIPPET_LEN = 90;  // Cap độ dài stem snippet mỗi câu
const OPTION_SNIPPET_LEN = 80; // Cap option text mỗi đáp án

const STOP_TAGS = new Set(['ets', 'hackers', 'ets-2026']);
function isUsefulTag(t) {
  if (!t) return false;
  if (/^part\d+$/i.test(t)) return false;     // 'part3' redundant với Part field
  if (/^test-?\d+$/i.test(t)) return false;   // 'test-04' redundant
  if (STOP_TAGS.has(t.toLowerCase())) return false;
  return true;
}

function shortStem(text) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= STEM_SNIPPET_LEN) return cleaned;
  return cleaned.slice(0, STEM_SNIPPET_LEN - 1) + '…';
}

function shortOption(text) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= OPTION_SNIPPET_LEN) return cleaned;
  return cleaned.slice(0, OPTION_SNIPPET_LEN - 1) + '…';
}

function pickOptionText(options, key) {
  if (!options?.length || !key) return '';
  const o = options.find((opt) => opt.key === key);
  return shortOption(o?.text || '');
}

/**
 * Quét answers + questions để build error patterns đầy đủ cho prompt:
 *   - errorBreakdown: per-Part wrong stats (tags, difficulty, slow count) — giữ nguyên
 *     để section CHI TIẾT LỖI TỪNG PART tiếp tục work.
 *   - wrongQuestionDetails: top 15 câu sai informative nhất (sort theo độ khó +
 *     slow) để prompt ép AI reference số câu cụ thể.
 *   - strongPatterns: per-Part top 3 tag mà user làm ĐÚNG nhiều lần → AI khen
 *     cụ thể theo subskill thay vì chung chung.
 *
 * Số câu toàn cục (globalNum) compute từ PART_OFFSETS + thứ tự xuất hiện
 * trong cùng Part — match cách FE đánh số 1-200.
 *
 * @param {Array} answers      - result.answers (theo thứ tự test)
 * @param {Array} questions    - Question docs (lean) cho các questionId xuất hiện
 * @returns {{ errorBreakdown: Object, wrongQuestionDetails: Array, strongPatterns: Object }}
 */
function buildErrorPatterns(answers, questions) {
  if (!answers?.length || !questions?.length) {
    return { errorBreakdown: {}, wrongQuestionDetails: [], strongPatterns: {} };
  }

  const qMap = new Map(questions.map((q) => [String(q._id), q]));

  // Avg time per Part — dùng để xác định "câu chậm bất thường"
  const partTimes = {};
  answers.forEach((a) => {
    const q = qMap.get(String(a.questionId));
    if (!q || !a.timeSpentSec) return;
    partTimes[q.part] ??= [];
    partTimes[q.part].push(a.timeSpentSec);
  });
  const partAvgTime = {};
  Object.entries(partTimes).forEach(([p, arr]) => {
    partAvgTime[p] = arr.reduce((s, x) => s + x, 0) / arr.length;
  });

  // Counter per-Part để gán globalNum theo thứ tự xuất hiện trong cùng Part.
  // Practice có 1 Part (vd Part 3) → globalNum bắt đầu từ 32. Full Test → 1-200.
  const partCounter = {};

  const errorBreakdown = {};
  const wrongDetails = [];
  const correctTagCounts = {}; // { [part]: { tag: count } }

  answers.forEach((a) => {
    const q = qMap.get(String(a.questionId));
    if (!q) return;
    const p = q.part;
    partCounter[p] = (partCounter[p] || 0) + 1;
    const globalNum = (PART_OFFSETS[p] || 1) + partCounter[p] - 1;

    errorBreakdown[p] ??= {
      wrongCount: 0,
      totalCount: 0,
      tagCounts: {},
      difficultyCounts: { easy: 0, medium: 0, hard: 0 },
      slowCount: 0,
    };
    errorBreakdown[p].totalCount += 1;

    const isSlow =
      a.timeSpentSec && partAvgTime[p] && a.timeSpentSec >= 1.5 * partAvgTime[p];

    if (a.isCorrect) {
      // Strong patterns: count đúng theo tag (chỉ tag hữu ích)
      correctTagCounts[p] ??= {};
      (q.tags || []).filter(isUsefulTag).forEach((t) => {
        correctTagCounts[p][t] = (correctTagCounts[p][t] || 0) + 1;
      });
      return;
    }

    // Aggregate wrong
    errorBreakdown[p].wrongCount += 1;
    const diff = q.difficulty || 'medium';
    errorBreakdown[p].difficultyCounts[diff] += 1;
    (q.tags || []).filter(isUsefulTag).forEach((t) => {
      errorBreakdown[p].tagCounts[t] = (errorBreakdown[p].tagCounts[t] || 0) + 1;
    });
    if (isSlow) errorBreakdown[p].slowCount += 1;

    // Detail-level for top-K wrong reference
    const usefulTags = (q.tags || []).filter(isUsefulTag);
    wrongDetails.push({
      globalNum,
      part: p,
      difficulty: diff,
      isSlow: Boolean(isSlow),
      timeSpentSec: a.timeSpentSec || 0,
      selected: a.selected || null,
      correct: q.correctAnswer,
      selectedText: pickOptionText(q.options, a.selected),
      correctText: pickOptionText(q.options, q.correctAnswer),
      primaryTag: usefulTags[0] || '',
      stemSnippet: shortStem(q.content?.text),
    });
  });

  // Sort wrong details theo điểm informativeness: hard + slow ưu tiên cao
  // (hard=3, medium=2, easy=1; slow +2). Trong cùng score, ưu tiên globalNum
  // tăng dần để AI tham chiếu theo thứ tự đề.
  const diffWeight = { hard: 3, medium: 2, easy: 1 };
  wrongDetails.sort((a, b) => {
    const sa = (diffWeight[a.difficulty] || 2) + (a.isSlow ? 2 : 0);
    const sb = (diffWeight[b.difficulty] || 2) + (b.isSlow ? 2 : 0);
    if (sb !== sa) return sb - sa;
    return a.globalNum - b.globalNum;
  });
  const wrongQuestionDetails = wrongDetails.slice(0, MAX_WRONG_DETAILS);

  // Strong patterns: per-Part top 3 tag có correctCount >= 2 (lọc noise)
  const strongPatterns = {};
  Object.entries(correctTagCounts).forEach(([p, tags]) => {
    const top = Object.entries(tags)
      .filter(([, n]) => n >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));
    if (top.length > 0) strongPatterns[p] = top;
  });

  return { errorBreakdown, wrongQuestionDetails, strongPatterns };
}

/**
 * Sau khi có recommendations từ AI/heuristic, với mỗi rec có targetPart hợp lệ,
 * tìm 1 Practice test phù hợp để gắn vào — FE sẽ render nút "Luyện ngay".
 *
 * Ưu tiên test cùng series với test gốc nếu có; nếu không, lấy latest published.
 * Bỏ qua test trùng với testId của result để không gợi ý chính bài vừa làm.
 *
 * @param {Array} recommendations - mảng rec đã có targetPart
 * @param {Object} result         - Result document (lean) — để biết testId, series
 * @returns {Promise<Array>} recommendations đã enrich
 */
async function attachSuggestedTests(recommendations, result) {
  if (!recommendations?.length) return recommendations;

  // Gom các targetPart cần look up
  const targetParts = [
    ...new Set(
      recommendations
        .map((r) => r.targetPart)
        .filter((p) => Number.isInteger(p) && p >= 1 && p <= 7),
    ),
  ];
  if (targetParts.length === 0) return recommendations;

  // Lấy series + testId gốc để filter
  let sourceSeries = '';
  try {
    const sourceTest = await Test.findById(result.testId)
      .select('series')
      .lean();
    sourceSeries = sourceTest?.series || '';
  } catch {
    // Không critical — bỏ qua, dùng latest published
  }

  // Query 1 lần: tất cả Practice tests thuộc các targetPart, published
  const candidates = await Test.find({
    type: 'part',
    part: { $in: targetParts },
    isPublished: true,
    _id: { $ne: result.testId },
  })
    .select('_id title part series createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // Group by part, ưu tiên cùng series
  const byPart = {};
  candidates.forEach((t) => {
    byPart[t.part] ??= [];
    byPart[t.part].push(t);
  });
  Object.values(byPart).forEach((arr) => {
    arr.sort((a, b) => {
      const aMatch = sourceSeries && a.series === sourceSeries ? 1 : 0;
      const bMatch = sourceSeries && b.series === sourceSeries ? 1 : 0;
      return bMatch - aMatch; // same-series first, sort stable theo createdAt desc
    });
  });

  return recommendations.map((r) => {
    if (!Number.isInteger(r.targetPart)) return r;
    const pick = byPart[r.targetPart]?.[0];
    if (!pick) return r;
    return {
      ...r,
      suggestedTestId: pick._id,
      suggestedTestTitle: pick.title,
    };
  });
}

const EMPTY_ATTEMPT_ANSWERED_RATIO = 0.2; // <20% câu trả lời → coi là bài rỗng
const EMPTY_ATTEMPT_ACCURACY = 5;          // hoặc accuracy <5%

/**
 * Phát hiện bài rỗng — user bỏ trống đại đa số câu hoặc gần như không câu nào
 * đúng. Trong trường hợp này, AI/heuristic đều không có signal để phân tích
 * điểm mạnh/yếu thực sự — sẽ bịa nội dung. Tốt hơn là short-circuit + trả
 * thông điệp rõ ràng yêu cầu user làm lại nghiêm túc.
 */
function detectEmptyAttempt(result) {
  const total = result.totalQuestions || 0;
  if (total === 0) return { isEmpty: true, answeredCount: 0, total: 0 };
  const answeredCount = (result.answers || []).filter(
    (a) => a.selected != null,
  ).length;
  const isEmpty =
    answeredCount < total * EMPTY_ATTEMPT_ANSWERED_RATIO ||
    (result.accuracy || 0) < EMPTY_ATTEMPT_ACCURACY;
  return { isEmpty, answeredCount, total };
}

function buildEmptyAttemptAnalysis({ answeredCount, total }) {
  const blank = total - answeredCount;
  return {
    strengths: [],
    weaknesses: [
      `Bạn bỏ trống ${blank}/${total} câu — chưa đủ dữ liệu để phân tích điểm mạnh/yếu thực sự.`,
    ],
    recommendations: [
      {
        topic: 'Làm lại bài nghiêm túc',
        action:
          'Quay lại bài này và làm nghiêm túc (cố gắng trả lời tất cả các câu, kể cả khi không chắc) để hệ thống phân tích chi tiết từng dạng câu sai và đưa lộ trình ôn tập phù hợp.',
        priority: 'high',
        targetPart: null,
      },
    ],
    estimatedTargetWeeks: 0,
  };
}

function buildHeuristicAnalysis(result, user) {
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
    targetPart: p.part,
  }));

  // Estimate weeks chỉ cho Full Test — Practice 1 Part không đủ data
  // để ước lượng thời gian đạt mục tiêu tổng.
  let estimatedTargetWeeks = 0;
  if (result.testType === 'full') {
    const targetScore = user?.targetScore || 700;
    const gap = Math.max(0, targetScore - (result.scoreTotal || 0));
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
 * Call OpenAI Chat Completion with structured output (strict JSON schema).
 * Returns null on any failure — caller falls back to heuristic.
 *
 * @param {Object} params
 * @param {Object} params.result          - Result document (lean)
 * @param {Object} [params.user]          - User document (lean) to read targetScore
 * @param {Object} [params.errorBreakdown] - Per-Part wrong-answer patterns
 * @returns {Promise<{ payload: Object, tokensUsed: number, rawResponse: string } | null>}
 */
async function callOpenAI({
  result,
  user,
  errorBreakdown,
  wrongQuestionDetails,
  strongPatterns,
}) {
  const client = getOpenAIClient();
  if (!client) return null;

  const { systemPrompt, userPrompt } = buildAnalysisPrompt({
    result,
    user,
    errorBreakdown,
    wrongQuestionDetails,
    strongPatterns,
  });

  try {
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: ANALYSIS_JSON_SCHEMA,
      temperature: 0.2,
    });

    const choice = completion.choices?.[0];
    const raw = choice?.message?.content;
    if (!raw) {
      logger.error('OpenAI returned empty content');
      return null;
    }
    if (choice.finish_reason === 'length') {
      logger.error('OpenAI response truncated', { finish_reason: 'length' });
      return null;
    }

    const payload = JSON.parse(raw); // strict mode guarantees valid JSON
    return {
      payload,
      tokensUsed: completion.usage?.total_tokens || 0,
      rawResponse: raw,
    };
  } catch (err) {
    logger.error('OpenAI call failed', { err: err.message });
    return null;
  }
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

      const existing = await AIAnalysis.findOne({ resultId }).lean();
      if (existing) return existing;

      // Bài rỗng (bỏ trống đại đa số câu / accuracy gần 0) — short-circuit,
      // KHÔNG gọi AI vì không có signal để phân tích. AI sẽ bịa Part-level
      // weaknesses ("Dạng X Part 1 — sai 6 câu") dù user không trả lời câu nào.
      const empty = detectEmptyAttempt(result);
      if (empty.isEmpty) {
        const payload = buildEmptyAttemptAnalysis(empty);
        const doc = await AIAnalysis.create({
          resultId,
          userId: result.userId,
          model: 'empty-attempt-v1',
          promptVersion: PROMPT_VERSION,
          strengths: payload.strengths,
          weaknesses: payload.weaknesses,
          recommendations: payload.recommendations,
          estimatedTargetWeeks: payload.estimatedTargetWeeks,
          rawResponse: '',
          tokensUsed: 0,
          isFallback: true,
        });
        return doc.toObject();
      }

      // Fetch user for targetScore — used in prompt to ground recommendations.
      const user = await User.findById(result.userId)
        .select('targetScore fullName')
        .lean();

      // Fetch question metadata cho các câu trong bài → build errorBreakdown
      // bám sát lỗi thực tế (tags, difficulty, slow questions).
      const questionIds = (result.answers || []).map((a) => a.questionId);
      const questions = questionIds.length
        ? await Question.find({ _id: { $in: questionIds } })
            .select('part tags difficulty correctAnswer content.text options')
            .lean()
        : [];
      const { errorBreakdown, wrongQuestionDetails, strongPatterns } =
        buildErrorPatterns(result.answers, questions);

      const aiResponse = await callOpenAI({
        result,
        user,
        errorBreakdown,
        wrongQuestionDetails,
        strongPatterns,
      });
      const isFallback = !aiResponse;
      const payload = aiResponse?.payload || buildHeuristicAnalysis(result, user);

      // Gắn Practice test gợi ý vào từng recommendation có targetPart hợp lệ.
      const enrichedRecs = await attachSuggestedTests(
        payload.recommendations || [],
        result,
      );

      const doc = await AIAnalysis.create({
        resultId,
        userId: result.userId,
        model: isFallback ? 'heuristic-v1' : env.OPENAI_MODEL,
        promptVersion: PROMPT_VERSION,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        recommendations: enrichedRecs,
        estimatedTargetWeeks: payload.estimatedTargetWeeks,
        rawResponse: aiResponse?.rawResponse || '',
        tokensUsed: aiResponse?.tokensUsed || 0,
        isFallback,
      });

      return doc.toObject();
    } catch (err) {
      logger.error('aiAnalysisService.generateForResult failed', {
        resultId,
        err: err.message,
      });
      return null;
    }
  },

  /**
   * Get existing analysis for a result. Does NOT generate.
   */
  async getByResultId(resultId) {
    return AIAnalysis.findOne({ resultId }).lean();
  },

  /**
   * Force a fresh OpenAI call by deleting any existing analysis first.
   * Used by POST /ai/analyze/:resultId when user wants to retry/refresh.
   * Burns OpenAI tokens — caller should rate-limit.
   *
   * @param {string} resultId
   * @returns {Promise<Object|null>}
   */
  async regenerateForResult(resultId) {
    await AIAnalysis.deleteOne({ resultId });
    return this.generateForResult(resultId);
  },
};
