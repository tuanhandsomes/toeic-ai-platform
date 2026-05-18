import { Result } from '../models/Result.js';
import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { ApiError } from '../utils/ApiError.js';
import { gradeTest } from './scoringService.js';

export const resultService = {
  /**
   * Submit a test, grade it, save Result, return it.
   *
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.testId
   * @param {Date}   params.startedAt
   * @param {Array<{questionId, selected, timeSpentSec}>} params.answers
   */
  async submit({ userId, testId, startedAt, answers }) {
    const test = await Test.findById(testId).lean();
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');

    // Load all questions referenced in answers (and in the test)
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('part correctAnswer')
      .lean();

    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    // Build graded answers: merge selected with question's part + correctAnswer
    const gradedInput = answers.map((a) => {
      const q = questionMap.get(String(a.questionId));
      if (!q) throw ApiError.badRequest(`Question ${a.questionId} không tồn tại`);
      return {
        questionId: a.questionId,
        part: q.part,
        correctAnswer: q.correctAnswer,
        selected: a.selected,
        timeSpentSec: a.timeSpentSec || 0,
      };
    });

    const graded = gradeTest({ gradedAnswers: gradedInput, testType: test.type });

    const submittedAt = new Date();
    const durationSec = Math.max(
      0,
      Math.round((submittedAt.getTime() - new Date(startedAt).getTime()) / 1000),
    );

    const result = await Result.create({
      userId,
      testId,
      testType: test.type,
      startedAt,
      submittedAt,
      durationSec,
      ...graded,
    });

    return result.toObject();
  },

  /**
   * Get user's result history.
   */
  async listForUser(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Result.find({ userId })
        .populate('testId', 'title type part durationMinutes totalQuestions')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Result.countDocuments({ userId }),
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
   * Get a single result detail. Includes questions WITH correctAnswer + explanation.
   * Verifies ownership.
   */
  async getByIdForUser(resultId, userId) {
    const result = await Result.findById(resultId)
      .populate('testId', 'title type part durationMinutes totalQuestions')
      .lean();

    if (!result) throw ApiError.notFound('Không tìm thấy kết quả');
    if (String(result.userId) !== String(userId)) {
      throw ApiError.forbidden('Bạn không có quyền xem kết quả này');
    }

    // Load full question data for review (includes correctAnswer, explanation, vocab)
    const questionIds = result.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const questionMap = new Map(questions.map((q) => [String(q._id), q]));

    const answersWithQuestion = result.answers.map((a) => ({
      ...a,
      question: questionMap.get(String(a.questionId)) || null,
    }));

    return { ...result, answers: answersWithQuestion };
  },
};
