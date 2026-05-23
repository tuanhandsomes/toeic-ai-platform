import Joi from "joi";

/**
 * Admin validation:
 *   - user lock action
 *   - user listing query
 *
 * Test + Question schemas moved out to testValidation.js + questionValidation.js
 */

export const lockUserSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const listUsersQuerySchema = Joi.object({
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
  search: Joi.string().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
