import Joi from "joi";

/**
 * Admin validation:
 *   - user list + CRUD + lock + reset password
 *
 * Test + Question schemas moved out to testValidation.js + questionValidation.js
 */

const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase();

export const listUsersQuerySchema = Joi.object({
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
  search: Joi.string().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: emailField.required(),
  password: Joi.string().min(6).max(72).required(),
  role: Joi.string().valid("user", "admin").default("user"),
  targetScore: Joi.number().integer().min(10).max(990).default(700),
  isActive: Joi.boolean().default(true),
});

// Tất cả field optional — admin có thể sửa một phần.
// .min(1) đảm bảo body không rỗng (tránh PATCH no-op).
export const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  email: emailField,
  role: Joi.string().valid("user", "admin"),
  targetScore: Joi.number().integer().min(10).max(990),
}).min(1);

export const lockUserSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const resetUserPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(72).required(),
});
