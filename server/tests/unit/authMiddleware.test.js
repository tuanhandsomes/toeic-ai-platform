import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../src/models/User.js', () => ({
  User: { findById: vi.fn() },
}));

const { requireAuth } = await import(
  '../../src/middlewares/authMiddleware.js'
);
const { User } = await import('../../src/models/User.js');

const fakeUser = (overrides = {}) => ({
  _id: 'u1',
  isActive: true,
  role: 'user',
  ...overrides,
});

// asyncHandler trong requireAuth không return promise → test phải flush
// microtasks sau khi gọi để chờ inner `await User.findById(...).then(...)`.
const flush = () => new Promise((resolve) => setImmediate(resolve));

const validAccessToken = (sub = 'u1') =>
  jwt.sign({ sub, role: 'user' }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requireAuth', () => {
  it('throws 401 when Authorization header missing', async () => {
    const next = vi.fn();
    await requireAuth({ headers: {} }, {}, next);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Thiếu access token',
    });
  });

  it('throws 401 when header is not Bearer', async () => {
    const next = vi.fn();
    await requireAuth(
      { headers: { authorization: 'Basic xyz' } },
      {},
      next,
    );
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('throws 401 on invalid JWT', async () => {
    const next = vi.fn();
    await requireAuth(
      { headers: { authorization: 'Bearer garbage' } },
      {},
      next,
    );
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Access token không hợp lệ hoặc đã hết hạn',
    });
  });

  it('throws 401 on expired JWT', async () => {
    const expired = jwt.sign(
      { sub: 'u1' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' },
    );
    const next = vi.fn();
    await requireAuth(
      { headers: { authorization: `Bearer ${expired}` } },
      {},
      next,
    );
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('throws 401 when user not found in DB', async () => {
    User.findById.mockResolvedValue(null);
    const next = vi.fn();
    requireAuth(
      { headers: { authorization: `Bearer ${validAccessToken()}` } },
      {},
      next,
    );
    await flush();
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 401,
      message: 'Tài khoản không tồn tại hoặc đã bị khóa',
    });
  });

  it('throws 401 when user.isActive=false', async () => {
    User.findById.mockResolvedValue(fakeUser({ isActive: false }));
    const next = vi.fn();
    requireAuth(
      { headers: { authorization: `Bearer ${validAccessToken()}` } },
      {},
      next,
    );
    await flush();
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('attaches req.user + calls next() on success', async () => {
    const u = fakeUser();
    User.findById.mockResolvedValue(u);
    const req = {
      headers: { authorization: `Bearer ${validAccessToken('u1')}` },
    };
    const next = vi.fn();
    requireAuth(req, {}, next);
    await flush();
    expect(req.user).toBe(u);
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith(); // no error
  });

  it('uses sub claim from JWT to look up user', async () => {
    User.findById.mockResolvedValue(fakeUser({ _id: 'u42' }));
    const req = {
      headers: { authorization: `Bearer ${validAccessToken('u42')}` },
    };
    requireAuth(req, {}, vi.fn());
    await flush();
    expect(User.findById).toHaveBeenCalledWith('u42');
  });
});
