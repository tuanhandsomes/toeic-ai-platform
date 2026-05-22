import { ApiError } from '../utils/ApiError.js';

const formatErrors = (error) =>
  error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));

export const validate = (schema) => (req, _res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(ApiError.badRequest('Dữ liệu không hợp lệ', formatErrors(error)));
  }
  req.body = value;
  next();
};

export const validateQuery = (schema) => (req, _res, next) => {
  const { value, error } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(ApiError.badRequest('Tham số không hợp lệ', formatErrors(error)));
  }
  req.query = value;
  next();
};
