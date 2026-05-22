import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
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

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw ApiError.forbidden('Tài khoản đã bị khóa');

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
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
};
