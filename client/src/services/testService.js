import axiosClient from './axiosClient.js';

export const testService = {
  list(params = {}) {
    return axiosClient.get('/tests', { params });
  },

  getById(id) {
    return axiosClient.get(`/tests/${id}`);
  },
};
