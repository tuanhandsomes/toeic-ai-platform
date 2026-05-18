import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  async updateProfile(userId, data) {
    const allowed = ['fullName', 'targetScore', 'avatar'];
    const update = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!user) throw ApiError.notFound('Người dùng không tồn tại');
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw ApiError.notFound('Người dùng không tồn tại');

    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.unauthorized('Mật khẩu hiện tại không đúng');

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    return user;
  },
};
