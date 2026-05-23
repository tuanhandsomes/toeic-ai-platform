import { User } from "../models/User.js";
import { Test } from "../models/Test.js";
import { Question } from "../models/Question.js";
import { Result } from "../models/Result.js";
import { AIAnalysis } from "../models/AIAnalysis.js";
import { ApiError } from "../utils/ApiError.js";
import { authService } from "./authService.js";

/**
 * Admin service:
 *   - system-wide stats
 *   - user management (list, lock)
 *
 * Question + Test CRUD moved out to questionService.js + testService.js
 */
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
      User.countDocuments({ role: "admin" }),
      Test.countDocuments(),
      Test.countDocuments({ isPublished: true }),
      Question.countDocuments(),
      Result.countDocuments(),
      AIAnalysis.countDocuments(),
      Question.aggregate([
        { $group: { _id: "$part", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Result.find()
        .populate("userId", "fullName email")
        .populate("testId", "title type")
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
    if (typeof isActive === "boolean") query.isActive = isActive;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
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
      throw ApiError.badRequest("Không thể tự khóa chính mình");
    }
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
    if (user.role === "admin" && !isActive) {
      throw ApiError.badRequest("Không thể khóa tài khoản admin khác");
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
};
