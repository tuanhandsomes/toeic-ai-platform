import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/services/authService.js', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

const { useAuthStore } = await import('../../src/store/authStore.js');
const { authService } = await import('../../src/services/authService.js');

const resetStore = () =>
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  resetStore();
});

describe('useAuthStore.login', () => {
  it('saves tokens + user on success', async () => {
    authService.login.mockResolvedValue({
      data: {
        user: { _id: 'u1', email: 'a@b.com' },
        accessToken: 'ACCESS',
        refreshToken: 'REFRESH',
      },
    });
    const user = await useAuthStore.getState().login({
      email: 'a@b.com',
      password: 'x',
    });
    expect(user).toMatchObject({ _id: 'u1' });
    expect(localStorage.getItem('accessToken')).toBe('ACCESS');
    expect(localStorage.getItem('refreshToken')).toBe('REFRESH');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('resets loading + re-throws on failure', async () => {
    authService.login.mockRejectedValue(new Error('Wrong password'));
    await expect(
      useAuthStore.getState().login({ email: 'a@b.com' }),
    ).rejects.toThrow('Wrong password');
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

describe('useAuthStore.register', () => {
  it('saves tokens + user on success', async () => {
    authService.register.mockResolvedValue({
      data: {
        user: { _id: 'u2' },
        accessToken: 'A2',
        refreshToken: 'R2',
      },
    });
    await useAuthStore.getState().register({
      fullName: 'A',
      email: 'a@b.com',
      password: 'x',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('A2');
  });

  it('re-throws on failure', async () => {
    authService.register.mockRejectedValue(new Error('Email taken'));
    await expect(
      useAuthStore.getState().register({ email: 'a@b.com' }),
    ).rejects.toThrow('Email taken');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('useAuthStore.loadUser', () => {
  it('clears state when no access token in localStorage', async () => {
    useAuthStore.setState({
      user: { _id: 'u1' },
      isAuthenticated: true,
    });
    await useAuthStore.getState().loadUser();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(authService.me).not.toHaveBeenCalled();
  });

  it('fetches user via me() when token exists', async () => {
    localStorage.setItem('accessToken', 'AT');
    authService.me.mockResolvedValue({
      data: { user: { _id: 'u1' } },
    });
    await useAuthStore.getState().loadUser();
    expect(useAuthStore.getState().user).toEqual({ _id: 'u1' });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('clears storage on me() failure', async () => {
    localStorage.setItem('accessToken', 'AT');
    localStorage.setItem('refreshToken', 'RT');
    authService.me.mockRejectedValue(new Error('401'));
    await useAuthStore.getState().loadUser();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('useAuthStore.logout', () => {
  it('clears 3 auth keys but PRESERVES notif-read + rememberedEmail + exam drafts', async () => {
    localStorage.setItem('accessToken', 'AT');
    localStorage.setItem('refreshToken', 'RT');
    localStorage.setItem('notif-read:u1', '["streak:3"]');
    localStorage.setItem('rememberedEmail', 'a@b.com');
    localStorage.setItem('exam-draft:u1:t1', '{}');
    useAuthStore.setState({ user: { _id: 'u1' }, isAuthenticated: true });

    authService.logout.mockResolvedValue();
    await useAuthStore.getState().logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    // auth-storage is rewritten by zustand persist AFTER clearAuthStorage with
    // the cleared state — so it ends up containing user=null, NOT removed.
    const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(authStorage.state?.user).toBeNull();
    expect(authStorage.state?.isAuthenticated).toBe(false);
    // The 3 NON-auth keys must remain untouched
    expect(localStorage.getItem('notif-read:u1')).toBe('["streak:3"]');
    expect(localStorage.getItem('rememberedEmail')).toBe('a@b.com');
    expect(localStorage.getItem('exam-draft:u1:t1')).toBe('{}');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('clears local state even when BE logout API fails', async () => {
    localStorage.setItem('accessToken', 'AT');
    useAuthStore.setState({ user: { _id: 'u1' }, isAuthenticated: true });
    authService.logout.mockRejectedValue(new Error('500'));
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
