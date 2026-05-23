import axiosClient from './axiosClient.js';

/**
 * Submit + getById có thể trigger AI analysis OpenAI (~8-10s mỗi lần).
 * Default axios timeout 15s không đủ — bump lên 60s cho 2 endpoint này.
 */
const AI_AWARE_TIMEOUT = 60000; // 60s

export const resultService = {
  submit(data) {
    return axiosClient.post('/results', data, { timeout: AI_AWARE_TIMEOUT });
  },

  list(params = {}) {
    return axiosClient.get('/results', { params });
  },

  getById(id) {
    // Lazy AI generate có thể chậm nếu là full test chưa có analysis
    return axiosClient.get(`/results/${id}`, { timeout: AI_AWARE_TIMEOUT });
  },
};
