import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(
      ApiError.badRequest(
        'Dữ liệu không hợp lệ',
        error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      ),
    );
  }
  req.body = value;
  next();
};
