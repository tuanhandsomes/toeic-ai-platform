import axiosClient from './axiosClient.js';

export const userService = {
  me() {
    return axiosClient.get('/users/me');
  },

  updateProfile(data) {
    return axiosClient.patch('/users/me', data);
  },

  changePassword(currentPassword, newPassword) {
    return axiosClient.post('/users/me/change-password', { currentPassword, newPassword });
  },
};
