import axiosClient from './axiosClient.js';

export const authService = {
  register(data) {
    return axiosClient.post('/auth/register', data);
  },

  login(data) {
    return axiosClient.post('/auth/login', data);
  },

  refresh(refreshToken) {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },

  logout() {
    return axiosClient.post('/auth/logout');
  },

  me() {
    return axiosClient.get('/auth/me');
  },

  forgotPassword(email) {
    return axiosClient.post('/auth/forgot-password', { email });
  },

  verifyResetToken(token) {
    return axiosClient.get('/auth/reset-password/verify', { params: { token } });
  },

  resetPassword(token, newPassword) {
    return axiosClient.post('/auth/reset-password', { token, newPassword });
  },
};
