import { adminService } from '../services/adminService.js';
import { resultService } from '../services/resultService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminController = {
  // Stats
  stats: asyncHandler(async (_req, res) => {
    const data = await adminService.stats();
    res.json({ success: true, data });
  }),

  // Users
  listUsers: asyncHandler(async (req, res) => {
    const data = await adminService.listUsers(req.query);
    res.json({ success: true, data });
  }),

  getUser: asyncHandler(async (req, res) => {
    const user = await adminService.getUser(req.params.id);
    res.json({ success: true, data: { user } });
  }),

  // Lấy danh sách bài làm của 1 user — dùng cho trang chi tiết user của admin.
  // Reuse resultService.listForUser, không cần endpoint mới ở /results vì
  // admin scope nên giữ trong /admin/* để middleware requireAdmin protect.
  getUserResults: asyncHandler(async (req, res) => {
    const data = await resultService.listForUser(req.params.id, req.query);
    res.json({ success: true, data });
  }),

  createUser: asyncHandler(async (req, res) => {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ success: true, data: { user } });
  }),

  updateUser: asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(
      req.params.id,
      req.body,
      req.user._id,
    );
    res.json({ success: true, data: { user } });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id, req.user._id);
    res.json({ success: true, message: 'Đã xóa người dùng' });
  }),

  resetUserPassword: asyncHandler(async (req, res) => {
    await adminService.resetUserPassword(req.params.id, req.body.newPassword);
    res.json({ success: true, message: 'Đã đặt lại mật khẩu' });
  }),

  toggleUserLock: asyncHandler(async (req, res) => {
    const user = await adminService.toggleUserLock(
      req.params.id,
      req.body.isActive,
      req.user._id,
    );
    res.json({ success: true, data: { user } });
  }),
};
