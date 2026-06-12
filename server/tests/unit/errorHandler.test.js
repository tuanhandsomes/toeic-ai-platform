import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger BEFORE importing
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const { errorHandler, notFound } = await import(
  '../../src/middlewares/errorHandler.js'
);
const { ApiError } = await import('../../src/utils/ApiError.js');
const { logger } = await import('../../src/utils/logger.js');

const mockRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};
const mockReq = (overrides = {}) => ({
  method: 'GET',
  originalUrl: '/api/v1/foo',
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notFound', () => {
  it('forwards 404 ApiError with method + URL', () => {
    const next = vi.fn();
    notFound(mockReq(), {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('GET /api/v1/foo'),
    });
  });
});

describe('errorHandler — ApiError', () => {
  it('returns statusCode + message JSON for ApiError', () => {
    const res = mockRes();
    errorHandler(ApiError.badRequest('Bad'), mockReq(), res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad',
    });
  });

  it('includes details when present', () => {
    const res = mockRes();
    errorHandler(
      ApiError.badRequest('Validation failed', [{ field: 'email' }]),
      mockReq(),
      res,
      vi.fn(),
    );
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      details: [{ field: 'email' }],
    });
  });

  it('does not log non-500 errors', () => {
    errorHandler(
      ApiError.notFound('gone'),
      mockReq(),
      mockRes(),
      vi.fn(),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe('errorHandler — 500', () => {
  it('defaults to 500 when statusCode missing', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), mockReq(), res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'boom',
      }),
    );
  });

  it('logs 500 errors with method + url + stack', () => {
    const err = new Error('crash');
    errorHandler(err, mockReq(), mockRes(), vi.fn());
    expect(logger.error).toHaveBeenCalledWith(
      'Unhandled error',
      expect.objectContaining({
        method: 'GET',
        url: '/api/v1/foo',
        message: 'crash',
      }),
    );
  });

  it('falls back to default message when err.message empty', () => {
    const res = mockRes();
    const err = new Error('');
    err.message = '';
    errorHandler(err, mockReq(), res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });
});
