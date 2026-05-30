import Joi from 'joi';
import { passwordSchema } from './passwordRules.js';

// Joi mặc định chỉ chấp nhận một số TLD phổ biến → fail với .local, .lan, .internal.
// Tắt TLD whitelist nhưng vẫn enforce format "xxx@yyy.zzz".
const emailField = Joi.string().email({ tlds: { allow: false } }).lowercase().required();

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: emailField,
  password: passwordSchema,
  targetScore: Joi.number().integer().min(10).max(990).default(700),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required(),
  // "Ghi nhớ đăng nhập" — cấp refresh token dài hơn (30d thay vì 7d) nếu true.
  remember: Joi.boolean().default(false),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Optional refreshToken — logout works even without it (client-side clear only),
// but providing it lets the server revoke the DB record.
export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const forgotPasswordSchema = Joi.object({
  email: emailField,
});

export const resetPasswordSchema = Joi.object({
  // 32 random bytes rendered as 64 hex chars
  token: Joi.string().hex().length(64).required(),
  newPassword: passwordSchema,
});

export const verifyResetTokenQuerySchema = Joi.object({
  token: Joi.string().hex().length(64).required(),
});
