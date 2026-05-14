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
};
