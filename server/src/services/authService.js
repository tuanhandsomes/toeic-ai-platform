import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });

const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });

export const authService = {
  async register({ fullName, email, password, targetScore }) {
    const existing = await User.findOne({ email });
    if (existing) throw ApiError.conflict('Email này đã được đăng ký');

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ fullName, email, passwordHash, targetScore });

    return {
      user,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw ApiError.forbidden('Tài khoản đã bị khóa');

    return {
      user,
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
    };
  },

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw ApiError.unauthorized('Refresh token không hợp lệ');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Tài khoản không tồn tại');

    return { accessToken: signAccessToken(user) };
  },
};
