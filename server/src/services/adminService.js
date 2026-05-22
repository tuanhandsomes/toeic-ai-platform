import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Test } from '../models/Test.js';
import { Question } from '../models/Question.js';
import { Result } from '../models/Result.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { ApiError } from '../utils/ApiError.js';
import { authService } from './authService.js';

const PART_TYPE_DEFAULT = {
  1: 'photograph',
  2: 'question_response',
  3: 'conversation',
  4: 'talk',
  5: 'incomplete_sentence',
  6: 'text_completion',
  7: 'reading_comprehension',
};

export const adminService = {
  // ─── STATS ──────────────────────────────────────────────────────────────
  async stats() {
    const [
      totalUsers,
      activeUsers,
      totalAdmins,
      totalTests,
      publishedTests,
      totalQuestions,
      totalResults,
      totalAIAnalyses,
      questionsByPart,
      recentResults,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Test.countDocuments(),
      Test.countDocuments({ isPublished: true }),
      Question.countDocuments(),
      Result.countDocuments(),
      AIAnalysis.countDocuments(),
      Question.aggregate([{ $group: { _id: '$part', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Result.find()
        .populate('userId', 'fullName email')
        .populate('testId', 'title type')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, admins: totalAdmins },
      tests: { total: totalTests, published: publishedTests },
      questions: {
        total: totalQuestions,
        byPart: questionsByPart.map((p) => ({ part: p._id, count: p.count })),
      },
      activity: { totalResults, totalAIAnalyses, recentResults },
    };
  },

  // ─── USERS ──────────────────────────────────────────────────────────────
  async listUsers({ role, isActive, search, page = 1, limit = 20 }) {
    const query = {};
    if (role) query.role = role;
    if (typeof isActive === 'boolean') query.isActive = isActive;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async toggleUserLock(userId, isActive, currentUserId) {
    if (String(userId) === String(currentUserId)) {
      throw ApiError.badRequest('Không thể tự khóa chính mình');
    }
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');
    if (user.role === 'admin' && !isActive) {
      throw ApiError.badRequest('Không thể khóa tài khoản admin khác');
    }
    user.isActive = isActive;
    await user.save();

    // Locking a user must kill their refresh tokens — otherwise the locked
    // user's session keeps refreshing access tokens until 7-day JWT expiry.
    if (!isActive) {
      await authService.revokeAllForUser(userId);
    }

    return user.toJSON();
  },

  // ─── QUESTIONS ──────────────────────────────────────────────────────────
  async listQuestions({ part, difficulty, search, tag, page = 1, limit = 20 }) {
    const query = {};
    if (part) query.part = Number(part);
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { 'content.text': { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Question.countDocuments(query),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getQuestion(id) {
    const q = await Question.findById(id).lean();
    if (!q) throw ApiError.notFound('Không tìm thấy câu hỏi');
    return q;
  },

  async createQuestion(payload) {
    // Auto-fill type from part if missing
    if (!payload.type && payload.part) {
      payload.type = PART_TYPE_DEFAULT[payload.part];
    }
    const q = await Question.create(payload);
    return q.toObject();
  },

  async updateQuestion(id, payload) {
    const q = await Question.findById(id);
    if (!q) throw ApiError.notFound('Không tìm thấy câu hỏi');
    Object.assign(q, payload);
    if (payload.content) {
      q.content = { ...q.content.toObject(), ...payload.content };
    }
    await q.save();
    return q.toObject();
  },

  async deleteQuestion(id) {
    const q = await Question.findById(id);
    if (!q) throw ApiError.notFound('Không tìm thấy câu hỏi');
    const usedInTests = await Test.countDocuments({ questionIds: id });
    if (usedInTests > 0) {
      throw ApiError.badRequest(
        `Câu hỏi đang được dùng trong ${usedInTests} đề thi, không thể xóa. Hãy gỡ khỏi đề trước.`,
      );
    }
    await q.deleteOne();
    return { deletedId: id };
  },

  async importQuestions({ questions, defaultTags = [] }) {
    const docs = questions.map((q) => ({
      ...q,
      type: q.type || PART_TYPE_DEFAULT[q.part],
      tags: Array.from(new Set([...(q.tags || []), ...defaultTags])),
    }));
    const inserted = await Question.insertMany(docs, { ordered: false });
    return { insertedCount: inserted.length, ids: inserted.map((d) => d._id) };
  },

  // ─── TESTS ──────────────────────────────────────────────────────────────
  async listTests({ type, part, isPublished, search, page = 1, limit = 20 }) {
    const query = {};
    if (type) query.type = type;
    if (part) query.part = Number(part);
    if (typeof isPublished === 'boolean') query.isPublished = isPublished;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Test.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Test.countDocuments(query),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getTest(id) {
    const test = await Test.findById(id).populate('createdBy', 'fullName email').lean();
    if (!test) throw ApiError.notFound('Không tìm thấy đề thi');
    return test;
  },

  async createTest(payload, createdBy) {
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

  async updateTest(id, payload) {
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

  async deleteTest(id) {
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
