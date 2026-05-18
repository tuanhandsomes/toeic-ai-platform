import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { ApiError } from '../utils/ApiError.js';

const QUESTION_FIELDS_FOR_TAKING = '-correctAnswer -explanation -vocab';
const QUESTION_FIELDS_FOR_REVIEW = ''; // tất cả

export const testService = {
  /**
   * List tests with filters.
   *
   * @param {Object} params
   * @param {'full'|'part'} [params.type]
   * @param {number} [params.part]
   * @param {number} [params.year]
   * @param {string} [params.series]
   * @param {string} [params.search]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   */
  async list({ type, part, year, series, search, page = 1, limit = 20 } = {}) {
    const query = { isPublished: true };
    if (type) query.type = type;
    if (part) query.part = Number(part);
    if (year) query.year = Number(year);
    if (series) query.series = series;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Test.find(query)
        .select('-questionIds') // không trả về list ID dài ở endpoint list
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Test.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get test detail with questions populated.
   * Mode 'taking' (default): hide correctAnswer + explanation + vocab.
   * Mode 'review': include all fields.
   */
  async getById(testId, { mode = 'taking' } = {}) {
    const test = await Test.findById(testId).lean();
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');
    if (!test.isPublished) throw ApiError.notFound('Đề thi chưa được công bố');

    const fields = mode === 'review' ? QUESTION_FIELDS_FOR_REVIEW : QUESTION_FIELDS_FOR_TAKING;
    const questions = await Question.find({ _id: { $in: test.questionIds } })
      .select(fields)
      .lean();

    // Preserve order theo questionIds
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));
    const orderedQuestions = test.questionIds
      .map((id) => questionMap.get(String(id)))
      .filter(Boolean);

    return { ...test, questions: orderedQuestions };
  },
};
