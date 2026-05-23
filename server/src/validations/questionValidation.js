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

export const listQuestionsQuerySchema = Joi.object({
  part: Joi.number().integer().min(1).max(7),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  search: Joi.string().allow(''),
  tag: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
