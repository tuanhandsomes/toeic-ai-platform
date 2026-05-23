import mongoose from 'mongoose';
import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { Result } from '../models/Result.js';
import { ApiError } from '../utils/ApiError.js';

const QUESTION_FIELDS_FOR_TAKING = '-correctAnswer -explanation -vocab';
const QUESTION_FIELDS_FOR_REVIEW = ''; // tất cả

export const testService = {
  // ─── USER-FACING ──────────────────────────────────────────────────────────

  /**
   * List published tests with filters. User-facing endpoint.
   *
   * @param {Object} params
   * @param {'full'|'part'} [params.type]
   * @param {number} [params.part]
   * @param {number} [params.year]
   * @param {string} [params.series]
   * @param {string} [params.search]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {Object} [opts]
   * @param {boolean} [opts.adminView=false] — when true, include unpublished + populate createdBy
   */
  async list({ type, part, year, series, search, page = 1, limit = 20 } = {}, { adminView = false } = {}) {
    const query = {};
    if (!adminView) query.isPublished = true; // user only sees published
    if (type) query.type = type;
    if (part) query.part = Number(part);
    if (year) query.year = Number(year);
    if (series) query.series = series;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    let baseQuery = Test.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (adminView) {
      baseQuery = baseQuery.populate('createdBy', 'fullName email');
    } else {
      baseQuery = baseQuery.select('-questionIds'); // không trả về list ID dài ở endpoint list
    }

    const [items, total] = await Promise.all([baseQuery.lean(), Test.countDocuments(query)]);

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
   *
   * @param {string} testId
   * @param {Object} [opts]
   * @param {'taking'|'review'} [opts.mode='taking']
   * @param {boolean} [opts.adminView=false] — when true, skip isPublished check + populate createdBy
   */
  async getById(testId, { mode = 'taking', adminView = false } = {}) {
    let query = Test.findById(testId);
    if (adminView) query = query.populate('createdBy', 'fullName email');
    const test = await query.lean();

    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');
    if (!adminView && !test.isPublished) throw ApiError.notFound('Đề thi chưa được công bố');

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

  // ─── ADMIN-ONLY ───────────────────────────────────────────────────────────

  async create(payload, createdBy) {
    // Verify all questionIds exist
    const validIds = payload.questionIds.filter((id) => mongoose.isValidObjectId(id));
    const existing = await Question.countDocuments({ _id: { $in: validIds } });
    if (existing !== validIds.length) {
      throw ApiError.badRequest('Một số câu hỏi không tồn tại trong ngân hàng');
    }
    const test = await Test.create({
      ...payload,
      totalQuestions: payload.questionIds.length,
      createdBy,
    });
    return test.toObject();
  },

  async update(id, payload) {
    const test = await Test.findById(id);
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');
    if (payload.questionIds) {
      const validIds = payload.questionIds.filter((qid) => mongoose.isValidObjectId(qid));
      const existing = await Question.countDocuments({ _id: { $in: validIds } });
      if (existing !== validIds.length) {
        throw ApiError.badRequest('Một số câu hỏi không tồn tại trong ngân hàng');
      }
      payload.totalQuestions = payload.questionIds.length;
    }
    Object.assign(test, payload);
    await test.save();
    return test.toObject();
  },

  async remove(id) {
    const test = await Test.findById(id);
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');
    const usedInResults = await Result.countDocuments({ testId: id });
    if (usedInResults > 0) {
      throw ApiError.badRequest(
        `Đề có ${usedInResults} kết quả đã nộp, không thể xóa. Hãy unpublish thay vì xóa.`,
      );
    }
    await test.deleteOne();
    return { deletedId: id };
  },
};
