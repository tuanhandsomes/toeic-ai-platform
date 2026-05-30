import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { emailService } from './emailService.js';

const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 min — spec §8 best practice

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });

const signRefreshToken = (user, remember = false) =>
  jwt.sign({ sub: user._id.toString() }, env.JWT_REFRESH_SECRET, {
    expiresIn: remember
      ? env.JWT_REFRESH_EXPIRES_LONG // 30d khi user tick "Ghi nhớ"
      : env.JWT_REFRESH_EXPIRES, //      7d mặc định
  });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Persist the SHA-256 hash of a fresh refresh JWT to the RefreshToken collection
 * so it can later be revoked (logout) or checked (refresh endpoint).
 *
 * The expiresAt is read from the JWT's exp claim — keeps the TTL index honest
 * even if JWT_REFRESH_EXPIRES is changed later.
 */
async function persistRefreshToken(userId, refreshJwt) {
  const decoded = jwt.decode(refreshJwt);
  if (!decoded?.exp) {
    throw new Error('Refresh JWT missing exp claim');
  }
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshJwt),
    expiresAt: new Date(decoded.exp * 1000),
  });
}

export const authService = {
  async register({ fullName, email, password, targetScore }) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict('Email này đã được đăng ký');

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ fullName, email, passwordHash, targetScore });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await persistRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  async login({ email, password, remember = false }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw ApiError.forbidden('Tài khoản đã bị khóa');

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user, remember);
    await persistRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  },

  /**
   * Verify refresh JWT + ensure it's still in DB (not revoked/logged out).
   * Returns a new access token. Refresh token itself stays unchanged.
   */
  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Refresh token không hợp lệ');
    }

    // Check DB — token must exist and not have been revoked.
    const stored = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken) }).lean();
    if (!stored) throw ApiError.unauthorized('Refresh token đã bị thu hồi');

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Tài khoản không tồn tại');

    return { accessToken: signAccessToken(user) };
  },

  /**
   * Revoke a single refresh token (called on logout).
   * Idempotent — already-deleted/invalid tokens don't throw.
   */
  async revokeRefreshToken(refreshToken) {
    if (!refreshToken) return;
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  },

  /**
   * Revoke ALL refresh tokens for a user (e.g. on password change or admin lock).
   * Forces every device to re-login.
   */
  async revokeAllForUser(userId) {
    await RefreshToken.deleteMany({ userId });
  },

  /**
   * Forgot password flow — generate single-use token, email reset link.
   *
   * Security:
   * - Return success regardless of whether email exists (chống enumeration).
   * - Store SHA-256 hash, never raw token (DB leak defense).
   * - 30 min TTL via PasswordResetToken collection.
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      // Silently no-op — don't leak which emails are registered
      logger.info('Forgot password: unknown or inactive email', { email });
      return;
    }

    // Generate 32-byte random token (rendered as 64 hex chars in URL)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    // Best-effort send — emailService logs failure but doesn't throw, so
    // user always sees "If your email is registered, we sent a link".
    await emailService.sendPasswordReset({
      to: user.email,
      fullName: user.fullName,
      token: rawToken,
    });
  },

  /**
   * Verify a reset token without consuming it — used by FE on page load to
   * show invalid/expired UI BEFORE the user types a new password.
   * Idempotent. Returns true/throws.
   */
  async verifyResetToken(rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await PasswordResetToken.findOne({ tokenHash }).lean();

    if (!record || record.expiresAt < new Date()) {
      throw ApiError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
    return true;
  },

  /**
   * Reset password — verify token, set new password, revoke all sessions.
   */
  async resetPassword(rawToken, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record) {
      throw ApiError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }
    if (record.expiresAt < new Date()) {
      // Defensive — TTL index should have cleaned this up, but cleanup runs
      // every ~60s so there's a small window
      await record.deleteOne();
      throw ApiError.badRequest('Liên kết đặt lại mật khẩu đã hết hạn');
    }

    const user = await User.findById(record.userId).select('+passwordHash');
    if (!user || !user.isActive) {
      await record.deleteOne();
      throw ApiError.badRequest('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    // Single-use: drop the token + all the user's other reset tokens
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Security: same as change-password — kill every refresh token so
    // attacker (if any) holding the user's session is locked out.
    await RefreshToken.deleteMany({ userId: user._id });

    return { userId: user._id };
  },
};
