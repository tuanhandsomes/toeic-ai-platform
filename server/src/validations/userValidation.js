import Joi from 'joi';
import { passwordSchema } from './passwordRules.js';

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),
  targetScore: Joi.number().integer().min(10).max(990),
  avatar: Joi.string().uri().allow(''),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
});
