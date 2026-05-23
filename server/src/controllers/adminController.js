import { adminService } from '../services/adminService.js';
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

  toggleUserLock: asyncHandler(async (req, res) => {
    const user = await adminService.toggleUserLock(
      req.params.id,
      req.body.isActive,
      req.user._id,
    );
    res.json({ success: true, data: { user } });
  }),
};
