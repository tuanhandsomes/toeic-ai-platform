import { User } from "../models/User.js";
import { Test } from "../models/Test.js";
import { Question } from "../models/Question.js";
import { Result } from "../models/Result.js";
import { AIAnalysis } from "../models/AIAnalysis.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { ApiError } from "../utils/ApiError.js";
import { authService } from "./authService.js";

// Đảm bảo luôn còn ≥1 admin active sau thao tác demote/delete/lock.
// Throws nếu hành động sẽ làm hệ thống mất admin cuối cùng.
async function ensureNotLastAdmin(userId, action) {
  const activeAdmins = await User.countDocuments({
    role: "admin",
    isActive: true,
    _id: { $ne: userId },
  });
  if (activeAdmins === 0) {
    throw ApiError.badRequest(
      `Không thể ${action} admin cuối cùng của hệ thống`,
    );
  }
}

/**
 * Admin service:
 *   - system-wide stats
 *   - user management (list, CRUD, lock, reset password)
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

  async getUser(userId) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
    delete user.passwordHash;
    return user;
  },

  async createUser({ fullName, email, password, role, targetScore, isActive }) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict("Email này đã được đăng ký");

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      targetScore,
      isActive,
    });
    return user.toJSON();
  },

  async updateUser(userId, payload, currentUserId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

    const isSelf = String(userId) === String(currentUserId);
    const roleChanging = payload.role && payload.role !== user.role;

    if (roleChanging) {
      if (isSelf) {
        throw ApiError.badRequest("Không thể tự thay đổi vai trò của chính mình");
      }
      // Demote admin → user: phải đảm bảo còn admin khác active
      if (user.role === "admin" && payload.role === "user") {
        await ensureNotLastAdmin(userId, "hạ quyền");
      }
    }

    if (payload.email && payload.email !== user.email) {
      const existing = await User.findOne({ email: payload.email });
      if (existing) throw ApiError.conflict("Email này đã được đăng ký");
      user.email = payload.email;
    }
    if (payload.fullName !== undefined) user.fullName = payload.fullName;
    if (payload.targetScore !== undefined) user.targetScore = payload.targetScore;
    if (payload.role !== undefined) user.role = payload.role;

    await user.save();

    // Đổi role → JWT cũ còn claim role cũ, phải force re-login
    if (roleChanging) {
      await authService.revokeAllForUser(userId);
    }

    return user.toJSON();
  },

  async deleteUser(userId, currentUserId) {
    if (String(userId) === String(currentUserId)) {
      throw ApiError.badRequest("Không thể tự xóa chính mình");
    }
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

    if (user.role === "admin") {
      await ensureNotLastAdmin(userId, "xóa");
    }

    // Cascade — xóa toàn bộ dữ liệu liên quan trước khi xóa user
    await Promise.all([
      Result.deleteMany({ userId }),
      AIAnalysis.deleteMany({ userId }),
      RefreshToken.deleteMany({ userId }),
      PasswordResetToken.deleteMany({ userId }),
    ]);
    await user.deleteOne();

    return { _id: userId };
  },

  async resetUserPassword(userId, newPassword) {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    // Đổi mật khẩu → revoke mọi session để ép re-login
    await authService.revokeAllForUser(userId);

    return { _id: userId };
  },

  async toggleUserLock(userId, isActive, currentUserId) {
    if (String(userId) === String(currentUserId)) {
      throw ApiError.badRequest("Không thể tự khóa chính mình");
    }
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
    if (user.role === "admin" && !isActive) {
      await ensureNotLastAdmin(userId, "khóa");
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
