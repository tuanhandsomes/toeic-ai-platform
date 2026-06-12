import { describe, it, expect, vi } from 'vitest';
import {
  requireRole,
  requireAdmin,
} from '../../src/middlewares/roleMiddleware.js';

describe('requireRole factory', () => {
  it('calls next with 401 when req.user missing', () => {
    const next = vi.fn();
    requireRole('admin')({}, {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Chưa xác thực',
    });
  });

  it('calls next with 403 when role mismatch', () => {
    const next = vi.fn();
    requireRole('admin')({ user: { role: 'user' } }, {}, next);
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 403,
    });
    expect(next.mock.calls[0][0].message).toContain('admin');
  });

  it('passes through when role matches', () => {
    const next = vi.fn();
    requireRole('admin')({ user: { role: 'admin' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('accepts ANY of multiple roles', () => {
    const next = vi.fn();
    requireRole('admin', 'moderator')(
      { user: { role: 'moderator' } },
      {},
      next,
    );
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when role not in allow list', () => {
    const next = vi.fn();
    requireRole('admin', 'moderator')(
      { user: { role: 'user' } },
      {},
      next,
    );
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('error message lists all accepted roles', () => {
    const next = vi.fn();
    requireRole('admin', 'moderator')(
      { user: { role: 'user' } },
      {},
      next,
    );
    expect(next.mock.calls[0][0].message).toMatch(/admin.*moderator/);
  });
});

describe('requireAdmin (shortcut)', () => {
  it('rejects non-admin', () => {
    const next = vi.fn();
    requireAdmin({ user: { role: 'user' } }, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('accepts admin', () => {
    const next = vi.fn();
    requireAdmin({ user: { role: 'admin' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });
});
