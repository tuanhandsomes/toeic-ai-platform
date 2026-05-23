import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

const testBase = {
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('').default(''),
  type: Joi.string().valid('full', 'part').required(),
  part: Joi.number().integer().min(1).max(7).allow(null).default(null),
  questionIds: Joi.array().items(objectId).min(1).required(),
  durationMinutes: Joi.number().integer().min(1).max(300).required(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  series: Joi.string().allow('').default(''),
  year: Joi.number().integer().min(2000).max(2100).allow(null).default(null),
  isPublished: Joi.boolean().default(true),
};

export const createTestSchema = Joi.object(testBase).custom((value, helpers) => {
  if (value.type === 'part' && !value.part) {
    return helpers.error('any.invalid', {
      message: 'Test type=part bắt buộc có field part (1-7)',
    });
  }
  return value;
});

export const updateTestSchema = Joi.object({
  title: testBase.title.optional(),
  description: testBase.description.optional(),
  type: testBase.type.optional(),
  part: testBase.part.optional(),
  questionIds: Joi.array().items(objectId).min(1).optional(),
  durationMinutes: testBase.durationMinutes.optional(),
  difficulty: testBase.difficulty.optional(),
  series: testBase.series.optional(),
  year: testBase.year.optional(),
  isPublished: testBase.isPublished.optional(),
}).min(1);

export const listTestsQuerySchema = Joi.object({
  type: Joi.string().valid('full', 'part'),
  part: Joi.number().integer().min(1).max(7),
  year: Joi.number().integer().min(2000).max(2100),
  series: Joi.string(),
  isPublished: Joi.boolean(),
  search: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  // Admin-only flag — controller checks role before honouring
  adminView: Joi.string().valid('true', 'false'),
});
