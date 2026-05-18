import { userService } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  me: asyncHandler(async (req, res) => {
    res.json({ success: true, data: { user: req.user } });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ success: true, data: { user } });
  }),

  changePassword: asyncHandler(async (req, res) => {
    await userService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  }),
};
