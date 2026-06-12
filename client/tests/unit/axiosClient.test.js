import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios BEFORE importing axiosClient so its module-level interceptor
// wiring doesn't crash (import.meta.env reference, etc.).
vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => instance),
      post: vi.fn(),
    },
  };
});

const { isAuthEndpoint, extractError, redirectToLogin } = await import(
  '../../src/services/axiosClient.js'
);

beforeEach(() => {
  localStorage.clear();
  // jsdom: reset URL state
  window.history.pushState({}, '', '/dashboard');
});

describe('isAuthEndpoint', () => {
  it('matches /auth/login', () => {
    expect(isAuthEndpoint('/auth/login')).toBe(true);
    expect(isAuthEndpoint('http://api.example.com/api/v1/auth/login')).toBe(
      true,
    );
  });
  it('matches /auth/register', () => {
    expect(isAuthEndpoint('/auth/register')).toBe(true);
  });
  it('matches /auth/refresh', () => {
    expect(isAuthEndpoint('/auth/refresh')).toBe(true);
  });
  it('does NOT match other paths', () => {
    expect(isAuthEndpoint('/auth/me')).toBe(false);
    expect(isAuthEndpoint('/results')).toBe(false);
    expect(isAuthEndpoint('/tests')).toBe(false);
  });
  it('handles missing URL gracefully', () => {
    expect(isAuthEndpoint()).toBe(false);
    expect(isAuthEndpoint('')).toBe(false);
  });
});

describe('extractError', () => {
  it('unwraps BE response.data when present', () => {
    const err = {
      response: {
        data: { success: false, message: 'Email taken', details: ['email'] },
      },
    };
    expect(extractError(err)).toEqual({
      success: false,
      message: 'Email taken',
      details: ['email'],
    });
  });

  it('falls back to raw error when no response (network error)', () => {
    const err = new Error('Network Error');
    expect(extractError(err)).toBe(err);
  });

  it('falls back when err is null/undefined', () => {
    expect(extractError(null)).toBeNull();
    expect(extractError(undefined)).toBeUndefined();
  });
});

describe('redirectToLogin', () => {
  // jsdom does not let us reassign window.location.href directly, so we shadow
  // the navigation via a Proxy on location.href setter. To test we just check
  // the localStorage side-effect (the only deterministic outcome).
  it('clears 3 auth keys but preserves other state', () => {
    localStorage.setItem('accessToken', 'AT');
    localStorage.setItem('refreshToken', 'RT');
    localStorage.setItem('auth-storage', '{}');
    localStorage.setItem('notif-read:u1', '[]');
    localStorage.setItem('rememberedEmail', 'a@b.com');
    localStorage.setItem('exam-draft:u1:t1', '{}');

    try {
      redirectToLogin('session-expired');
    } catch {
      // jsdom may throw on location.href assignment — ignore
    }

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('auth-storage')).toBeNull();
    expect(localStorage.getItem('notif-read:u1')).toBe('[]');
    expect(localStorage.getItem('rememberedEmail')).toBe('a@b.com');
    expect(localStorage.getItem('exam-draft:u1:t1')).toBe('{}');
  });

  it('handles being already on /login (no redirect needed)', () => {
    window.history.pushState({}, '', '/login');
    localStorage.setItem('accessToken', 'AT');
    redirectToLogin('session-expired');
    expect(localStorage.getItem('accessToken')).toBeNull();
    // pathname stays /login (no navigation)
    expect(window.location.pathname).toBe('/login');
  });
});
