import axiosClient from './axiosClient.js';

export const resultService = {
  submit(data) {
    return axiosClient.post('/results', data);
  },

  list(params = {}) {
    return axiosClient.get('/results', { params });
  },

  getById(id) {
    return axiosClient.get(`/results/${id}`);
  },
};
