import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

const vocabItem = Joi.object({
  word: Joi.string().required(),
  meaning: Joi.string().required(),
});

const optionItem = Joi.object({
  key: Joi.string().valid('A', 'B', 'C', 'D').required(),
  text: Joi.string().required(),
});

// Part 2 → 3 options; other parts → 4 options
const questionBase = {
  part: Joi.number().integer().min(1).max(7).required(),
  type: Joi.string()
    .valid(
      'photograph',
      'question_response',
      'conversation',
      'talk',
      'incomplete_sentence',
      'text_completion',
      'reading_comprehension',
    )
    .required(),
  content: Joi.object({
    text: Joi.string().allow('').default(''),
    audioUrl: Joi.string().allow('').default(''),
    imageUrl: Joi.string().allow('').default(''),
    passageId: objectId.allow(null).default(null),
  }).default({}),
  options: Joi.array().items(optionItem).min(3).max(4).required(),
  correctAnswer: Joi.string().valid('A', 'B', 'C', 'D').required(),
  explanation: Joi.string().allow('').default(''),
  vocab: Joi.array().items(vocabItem).default([]),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  tags: Joi.array().items(Joi.string()).default([]),
};

export const createQuestionSchema = Joi.object(questionBase).custom((value, helpers) => {
  const expected = value.part === 2 ? 3 : 4;
  if (value.options.length !== expected) {
    return helpers.error('any.invalid', {
      message: `Part ${value.part} phải có ${expected} đáp án`,
    });
  }
  return value;
});

export const updateQuestionSchema = Joi.object({
  part: questionBase.part.optional(),
  type: questionBase.type.optional(),
  content: questionBase.content.optional(),
  options: Joi.array().items(optionItem).min(3).max(4).optional(),
  correctAnswer: Joi.string().valid('A', 'B', 'C', 'D').optional(),
  explanation: Joi.string().allow('').optional(),
  vocab: Joi.array().items(vocabItem).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

export const importQuestionsSchema = Joi.object({
  questions: Joi.array().items(Joi.object(questionBase)).min(1).required(),
  defaultTags: Joi.array().items(Joi.string()).default([]),
});

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
    return helpers.error('any.invalid', { message: 'Test type=part bắt buộc có field part (1-7)' });
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

export const lockUserSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const adminListQuestionsQuerySchema = Joi.object({
  part: Joi.number().integer().min(1).max(7),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  search: Joi.string().allow(''),
  tag: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const adminListUsersQuerySchema = Joi.object({
  role: Joi.string().valid('user', 'admin'),
  isActive: Joi.boolean(),
  search: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const adminListTestsQuerySchema = Joi.object({
  type: Joi.string().valid('full', 'part'),
  part: Joi.number().integer().min(1).max(7),
  isPublished: Joi.boolean(),
  search: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
