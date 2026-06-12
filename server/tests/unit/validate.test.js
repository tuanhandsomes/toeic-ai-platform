import { describe, it, expect, vi } from 'vitest';
import Joi from 'joi';
import { validate, validateQuery } from '../../src/middlewares/validate.js';

describe('validate (body)', () => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(0).optional(),
  });

  it('next() with no error on valid body', () => {
    const req = { body: { email: 'a@b.com', age: 20 } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('replaces req.body with validated + coerced value', () => {
    const req = { body: { email: 'a@b.com', age: '25', extra: 'strip me' } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(req.body.email).toBe('a@b.com');
    expect(req.body.age).toBe(25); // coerced to number
    expect(req.body.extra).toBeUndefined(); // stripUnknown removes it
  });

  it('next(ApiError 400) with details on invalid', () => {
    const req = { body: { email: 'not-an-email' } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledOnce();
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Dữ liệu không hợp lệ');
    expect(err.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
      ]),
    );
  });

  it('reports MULTIPLE errors (abortEarly=false)', () => {
    const req = { body: { email: 'bad', age: -5 } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.details.length).toBeGreaterThanOrEqual(2);
    const fields = err.details.map((d) => d.field);
    expect(fields).toContain('email');
    expect(fields).toContain('age');
  });

  it('details field uses dot notation for nested paths', () => {
    const nested = Joi.object({
      user: Joi.object({ email: Joi.string().email().required() }).required(),
    });
    const req = { body: { user: { email: 'bad' } } };
    const next = vi.fn();
    validate(nested)(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.details[0].field).toBe('user.email');
  });
});

describe('validateQuery', () => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  });

  it('coerces and applies defaults', () => {
    const req = { query: { page: '2' } };
    const next = vi.fn();
    validateQuery(schema)(req, {}, next);
    expect(req.query.page).toBe(2);
    expect(req.query.limit).toBe(20); // default applied
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects out-of-range limit with "Tham số không hợp lệ"', () => {
    const req = { query: { limit: '500' } };
    const next = vi.fn();
    validateQuery(schema)(req, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Tham số không hợp lệ');
  });
});
