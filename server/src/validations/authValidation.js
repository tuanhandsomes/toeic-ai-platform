import Joi from 'joi';

// Joi mặc định chỉ chấp nhận một số TLD phổ biến → fail với .local, .lan, .internal.
// Tắt TLD whitelist nhưng vẫn enforce format "xxx@yyy.zzz".
const emailField = Joi.string().email({ tlds: { allow: false } }).lowercase().required();

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: emailField,
  password: Joi.string().min(6).max(72).required(),
  targetScore: Joi.number().integer().min(10).max(990).default(700),
});

export const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Optional refreshToken — logout works even without it (client-side clear only),
// but providing it lets the server revoke the DB record.
export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});
