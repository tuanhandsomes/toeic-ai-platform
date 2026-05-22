import Joi from 'joi';

export const progressQuerySchema = Joi.object({
  range: Joi.string().valid('7d', '30d', '90d', 'all').default('30d'),
});

export const partsQuerySchema = Joi.object({
  testType: Joi.string().valid('full', 'part', 'all').default('all'),
});
