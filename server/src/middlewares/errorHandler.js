import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal server error',
  };

  if (err.details) payload.details = err.details;
  if (env.NODE_ENV === 'development' && status === 500) {
    payload.stack = err.stack;
  }

  if (status === 500) {
    logger.error('Unhandled error', {
      method: req.method,
      url: req.originalUrl,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json(payload);
};
