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

/**
 * Schema cho POST /tests/import — bundle upload (testInfo + questions).
 * KHÔNG require option count chính xác theo Part vì đã có Mongoose validator
 * (Part 2 = 3 options, khác = 4). Chỉ validate shape cơ bản ở đây.
 */
const importQuestionItem = Joi.object({
  questionNumber: Joi.number().integer().min(1).max(200).required(),
  part: Joi.number().integer().min(1).max(7).required(),
  text: Joi.string().allow('').optional(),
  audioUrl: Joi.string().allow('').optional(),
  imageUrl: Joi.string().allow('').optional(),
  options: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().valid('A', 'B', 'C', 'D').required(),
        text: Joi.string().required(),
      }),
    )
    .min(3)
    .max(4)
    .required(),
  correctAnswer: Joi.string().valid('A', 'B', 'C', 'D').required(),
  explanation: Joi.string().allow('').optional(),
  vocab: Joi.array()
    .items(Joi.object({ word: Joi.string().required(), meaning: Joi.string().required() }))
    .optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).unknown(true); // tolerate extra fields like _note from template files

export const importTestBundleSchema = Joi.object({
  testInfo: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    series: Joi.string().required(),
    year: Joi.number().integer().min(2000).max(2100).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
    description: Joi.string().allow('').optional(),
    testCode: Joi.string().pattern(/^T\d{2}$/i).optional(),
  }).unknown(true).required(),
  questions: Joi.array().items(importQuestionItem).min(1).required(),
}).unknown(true);

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
