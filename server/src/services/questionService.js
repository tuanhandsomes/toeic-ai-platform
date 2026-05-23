import { Question } from "../models/Question.js";
import { Test } from "../models/Test.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Question CRUD service — admin-only operations.
 * Extracted from adminService for clearer separation of concerns.
 */

const PART_TYPE_DEFAULT = {
  1: "photograph",
  2: "question_response",
  3: "conversation",
  4: "talk",
  5: "incomplete_sentence",
  6: "text_completion",
  7: "reading_comprehension",
};

export const questionService = {
  async list({ part, difficulty, search, tag, page = 1, limit = 20 } = {}) {
    const query = {};
    if (part) query.part = Number(part);
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { "content.text": { $regex: search, $options: "i" } },
        { explanation: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Question.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query),
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

  async getById(id) {
    const q = await Question.findById(id).lean();
    if (!q) throw ApiError.notFound("Không tìm thấy câu hỏi");
    return q;
  },

  async create(payload) {
    // Auto-fill type from part if missing
    if (!payload.type && payload.part) {
      payload.type = PART_TYPE_DEFAULT[payload.part];
    }
    const q = await Question.create(payload);
    return q.toObject();
  },

  async update(id, payload) {
    const q = await Question.findById(id);
    if (!q) throw ApiError.notFound("Không tìm thấy câu hỏi");
    Object.assign(q, payload);
    if (payload.content) {
      q.content = { ...q.content.toObject(), ...payload.content };
    }
    await q.save();
    return q.toObject();
  },

  async remove(id) {
    const q = await Question.findById(id);
    if (!q) throw ApiError.notFound("Không tìm thấy câu hỏi");
    const usedInTests = await Test.countDocuments({ questionIds: id });
    if (usedInTests > 0) {
      throw ApiError.badRequest(
        `Câu hỏi đang được dùng trong ${usedInTests} đề thi, không thể xóa. Hãy gỡ khỏi đề trước.`,
      );
    }
    await q.deleteOne();
    return { deletedId: id };
  },

  async importBulk({ questions, defaultTags = [] }) {
    const docs = questions.map((q) => ({
      ...q,
      type: q.type || PART_TYPE_DEFAULT[q.part],
      tags: Array.from(new Set([...(q.tags || []), ...defaultTags])),
    }));
    const inserted = await Question.insertMany(docs, { ordered: false });
    return { insertedCount: inserted.length, ids: inserted.map((d) => d._id) };
  },
};
