import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError.js';

describe('ApiError factories', () => {
  it('badRequest → 400 with message + details', () => {
    const e = ApiError.badRequest('Invalid input', { field: 'email' });
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe('Invalid input');
    expect(e.details).toEqual({ field: 'email' });
    expect(e.isOperational).toBe(true);
  });

  it('unauthorized → 401, default message', () => {
    const e = ApiError.unauthorized();
    expect(e.statusCode).toBe(401);
    expect(e.message).toBe('Unauthorized');
  });

  it('unauthorized → custom message', () => {
    const e = ApiError.unauthorized('Token expired');
    expect(e.message).toBe('Token expired');
  });

  it('forbidden → 403', () => {
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.forbidden('No access').message).toBe('No access');
  });

  it('notFound → 404', () => {
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.notFound().message).toBe('Not found');
  });

  it('conflict → 409', () => {
    expect(ApiError.conflict('Email taken').statusCode).toBe(409);
    expect(ApiError.conflict('Email taken').message).toBe('Email taken');
  });

  it('internal → 500, default message', () => {
    const e = ApiError.internal();
    expect(e.statusCode).toBe(500);
    expect(e.message).toBe('Internal server error');
  });

  it('details defaults to null', () => {
    expect(ApiError.unauthorized().details).toBeNull();
  });

  it('captures stack trace', () => {
    const e = ApiError.badRequest('foo');
    expect(e.stack).toBeDefined();
    expect(e.stack).toContain('ApiError');
  });
});
