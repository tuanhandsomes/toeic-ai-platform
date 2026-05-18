import Joi from 'joi';

export const submitResultSchema = Joi.object({
  testId: Joi.string().hex().length(24).required(),
  startedAt: Joi.date().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().hex().length(24).required(),
        selected: Joi.string().valid('A', 'B', 'C', 'D').allow(null).default(null),
        timeSpentSec: Joi.number().integer().min(0).default(0),
      }),
    )
    .min(1)
    .required(),
});
