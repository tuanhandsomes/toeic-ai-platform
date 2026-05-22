import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.json({ success: true, data: { user, accessToken, refreshToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const { accessToken } = await authService.refresh(req.body.refreshToken);
    res.json({ success: true, data: { accessToken } });
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ success: true, data: { user: req.user } });
  }),

  logout: asyncHandler(async (req, res) => {
    // Best-effort revoke. Idempotent — missing or invalid token is fine,
    // we just want the DB record gone if it exists.
    await authService.revokeRefreshToken(req.body?.refreshToken);
    res.json({ success: true, message: 'Đăng xuất thành công' });
  }),
};
