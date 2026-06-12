import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock all DB/external deps BEFORE importing authService
vi.mock('../../src/models/User.js', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    hashPassword: vi.fn(),
  },
}));
vi.mock('../../src/models/RefreshToken.js', () => ({
  RefreshToken: {
    create: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock('../../src/models/PasswordResetToken.js', () => ({
  PasswordResetToken: {
    create: vi.fn(),
    findOne: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock('../../src/services/emailService.js', () => ({
  emailService: {
    sendPasswordReset: vi.fn().mockResolvedValue(undefined),
  },
}));

const { authService } = await import('../../src/services/authService.js');
const { User } = await import('../../src/models/User.js');
const { RefreshToken } = await import('../../src/models/RefreshToken.js');
const { PasswordResetToken } = await import(
  '../../src/models/PasswordResetToken.js'
);
const { emailService } = await import('../../src/services/emailService.js');

const fakeUser = (overrides = {}) => ({
  _id: 'u1', // String has a .toString() returning itself — satisfies signAccessToken
  email: 'a@b.com',
  fullName: 'A',
  role: 'user',
  isActive: true,
  passwordHash: 'h',
  comparePassword: vi.fn().mockResolvedValue(true),
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.register', () => {
  it('throws conflict when email already exists', async () => {
    User.findOne.mockResolvedValue(fakeUser());
    await expect(
      authService.register({
        fullName: 'A',
        email: 'a@b.com',
        password: 'x',
        targetScore: 700,
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates user + persists refresh token on success', async () => {
    User.findOne.mockResolvedValue(null);
    User.hashPassword.mockResolvedValue('hashed-pw');
    const created = fakeUser();
    User.create.mockResolvedValue(created);

    const out = await authService.register({
      fullName: 'A',
      email: 'a@b.com',
      password: 'plain',
      targetScore: 800,
    });

    expect(User.hashPassword).toHaveBeenCalledWith('plain');
    expect(User.create).toHaveBeenCalledWith({
      fullName: 'A',
      email: 'a@b.com',
      passwordHash: 'hashed-pw',
      targetScore: 800,
    });
    expect(RefreshToken.create).toHaveBeenCalledOnce();
    expect(out.user).toBe(created);
    expect(typeof out.accessToken).toBe('string');
    expect(typeof out.refreshToken).toBe('string');
  });
});

describe('authService.login', () => {
  it('throws unauthorized when user not found', async () => {
    User.findOne.mockReturnValue({ select: () => Promise.resolve(null) });
    await expect(
      authService.login({ email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws unauthorized on wrong password', async () => {
    const u = fakeUser({
      comparePassword: vi.fn().mockResolvedValue(false),
    });
    User.findOne.mockReturnValue({ select: () => Promise.resolve(u) });
    await expect(
      authService.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws forbidden when account is inactive', async () => {
    const u = fakeUser({ isActive: false });
    User.findOne.mockReturnValue({ select: () => Promise.resolve(u) });
    await expect(
      authService.login({ email: 'a@b.com', password: 'ok' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('returns tokens + persists refresh on success', async () => {
    const u = fakeUser();
    User.findOne.mockReturnValue({ select: () => Promise.resolve(u) });
    const out = await authService.login({ email: 'a@b.com', password: 'ok' });
    expect(out.user).toBe(u);
    expect(out.accessToken).toBeTruthy();
    expect(out.refreshToken).toBeTruthy();
    expect(RefreshToken.create).toHaveBeenCalledOnce();
  });

  it('remember=true → refresh token has long expiry (≈30d)', async () => {
    const u = fakeUser();
    User.findOne.mockReturnValue({ select: () => Promise.resolve(u) });
    const out = await authService.login({
      email: 'a@b.com',
      password: 'ok',
      remember: true,
    });
    const decoded = jwt.decode(out.refreshToken);
    const lifetimeSec = decoded.exp - decoded.iat;
    // 30 days = 2592000s — allow ±60s slop
    expect(lifetimeSec).toBeGreaterThan(29 * 86400);
  });

  it('remember=false → refresh token expiry ≈7d', async () => {
    const u = fakeUser();
    User.findOne.mockReturnValue({ select: () => Promise.resolve(u) });
    const out = await authService.login({
      email: 'a@b.com',
      password: 'ok',
      remember: false,
    });
    const decoded = jwt.decode(out.refreshToken);
    const lifetimeSec = decoded.exp - decoded.iat;
    expect(lifetimeSec).toBeLessThan(8 * 86400);
    expect(lifetimeSec).toBeGreaterThan(6 * 86400);
  });
});

describe('authService.refresh', () => {
  it('throws on invalid JWT', async () => {
    await expect(authService.refresh('garbage')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws when token not in DB (revoked)', async () => {
    const refreshJwt = jwt.sign({ sub: 'u1' }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    RefreshToken.findOne.mockReturnValue({
      lean: () => Promise.resolve(null),
    });
    await expect(authService.refresh(refreshJwt)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws when user gone or inactive', async () => {
    const refreshJwt = jwt.sign({ sub: 'u1' }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    RefreshToken.findOne.mockReturnValue({
      lean: () => Promise.resolve({ id: 'rt1' }),
    });
    User.findById.mockResolvedValue(null);
    await expect(authService.refresh(refreshJwt)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('returns new access token on success', async () => {
    const refreshJwt = jwt.sign({ sub: 'u1' }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    RefreshToken.findOne.mockReturnValue({
      lean: () => Promise.resolve({ id: 'rt1' }),
    });
    User.findById.mockResolvedValue(fakeUser());
    const out = await authService.refresh(refreshJwt);
    expect(out.accessToken).toBeTruthy();
    const decoded = jwt.verify(out.accessToken, process.env.JWT_ACCESS_SECRET);
    expect(decoded.sub).toBe('u1');
  });
});

describe('authService.revoke{Refresh,All}', () => {
  it('revokeRefreshToken is a no-op for falsy token', async () => {
    await authService.revokeRefreshToken(null);
    expect(RefreshToken.deleteOne).not.toHaveBeenCalled();
  });

  it('revokeRefreshToken deletes by SHA-256 hash', async () => {
    await authService.revokeRefreshToken('rawjwt');
    expect(RefreshToken.deleteOne).toHaveBeenCalledOnce();
    const arg = RefreshToken.deleteOne.mock.calls[0][0];
    expect(arg.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('revokeAllForUser deletes all by userId', async () => {
    await authService.revokeAllForUser('u1');
    expect(RefreshToken.deleteMany).toHaveBeenCalledWith({ userId: 'u1' });
  });
});

describe('authService.forgotPassword', () => {
  it('silently no-ops for unknown email (anti-enumeration)', async () => {
    User.findOne.mockResolvedValue(null);
    await authService.forgotPassword('ghost@b.com');
    expect(PasswordResetToken.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('no-ops for inactive account', async () => {
    User.findOne.mockResolvedValue(fakeUser({ isActive: false }));
    await authService.forgotPassword('a@b.com');
    expect(PasswordResetToken.create).not.toHaveBeenCalled();
  });

  it('creates token + sends email on valid user', async () => {
    const u = fakeUser();
    User.findOne.mockResolvedValue(u);
    await authService.forgotPassword('a@b.com');
    expect(PasswordResetToken.create).toHaveBeenCalledOnce();
    const arg = PasswordResetToken.create.mock.calls[0][0];
    expect(arg.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(arg.expiresAt).toBeInstanceOf(Date);
    expect(emailService.sendPasswordReset).toHaveBeenCalledOnce();
    // Email gets the RAW token (not hash) for the user to click
    const emailArg = emailService.sendPasswordReset.mock.calls[0][0];
    expect(emailArg.token).toMatch(/^[a-f0-9]{64}$/);
    expect(emailArg.to).toBe('a@b.com');
  });
});

describe('authService.verifyResetToken', () => {
  it('throws on missing record', async () => {
    PasswordResetToken.findOne.mockReturnValue({
      lean: () => Promise.resolve(null),
    });
    await expect(authService.verifyResetToken('raw')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws on expired record', async () => {
    PasswordResetToken.findOne.mockReturnValue({
      lean: () =>
        Promise.resolve({
          expiresAt: new Date(Date.now() - 1000),
        }),
    });
    await expect(authService.verifyResetToken('raw')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('returns true for valid + unexpired record', async () => {
    PasswordResetToken.findOne.mockReturnValue({
      lean: () =>
        Promise.resolve({
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }),
    });
    await expect(authService.verifyResetToken('raw')).resolves.toBe(true);
  });
});

describe('authService.resetPassword', () => {
  it('throws on missing token', async () => {
    PasswordResetToken.findOne.mockResolvedValue(null);
    await expect(
      authService.resetPassword('raw', 'newpw'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws + deletes record when expired', async () => {
    const rec = {
      userId: 'u1',
      expiresAt: new Date(Date.now() - 1000),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };
    PasswordResetToken.findOne.mockResolvedValue(rec);
    await expect(
      authService.resetPassword('raw', 'newpw'),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(rec.deleteOne).toHaveBeenCalled();
  });

  it('throws + deletes record when user is missing/inactive', async () => {
    const rec = {
      userId: 'u1',
      expiresAt: new Date(Date.now() + 60_000),
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };
    PasswordResetToken.findOne.mockResolvedValue(rec);
    User.findById.mockReturnValue({ select: () => Promise.resolve(null) });
    await expect(
      authService.resetPassword('raw', 'newpw'),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(rec.deleteOne).toHaveBeenCalled();
  });

  it('updates password + revokes all refresh tokens on success', async () => {
    const rec = {
      userId: 'u1',
      expiresAt: new Date(Date.now() + 60_000),
      deleteOne: vi.fn(),
    };
    PasswordResetToken.findOne.mockResolvedValue(rec);
    const u = fakeUser();
    User.findById.mockReturnValue({ select: () => Promise.resolve(u) });
    User.hashPassword.mockResolvedValue('new-hash');

    const out = await authService.resetPassword('raw', 'newpw');

    expect(u.passwordHash).toBe('new-hash');
    expect(u.save).toHaveBeenCalled();
    expect(PasswordResetToken.deleteMany).toHaveBeenCalledWith({ userId: 'u1' });
    expect(RefreshToken.deleteMany).toHaveBeenCalledWith({ userId: 'u1' });
    expect(out).toEqual({ userId: 'u1' });
  });
});
