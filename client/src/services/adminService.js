import axiosClient from './axiosClient.js';

const buildQuery = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );
  return Object.keys(clean).length ? clean : undefined;
};

export const adminService = {
  // Stats
  stats() {
    return axiosClient.get('/admin/stats');
  },

  // Users
  listUsers(params) {
    return axiosClient.get('/admin/users', { params: buildQuery(params) });
  },
  toggleUserLock(id, isActive) {
    return axiosClient.patch(`/admin/users/${id}/lock`, { isActive });
  },

  // Questions
  listQuestions(params) {
    return axiosClient.get('/admin/questions', { params: buildQuery(params) });
  },
  getQuestion(id) {
    return axiosClient.get(`/admin/questions/${id}`);
  },
  createQuestion(payload) {
    return axiosClient.post('/admin/questions', payload);
  },
  updateQuestion(id, payload) {
    return axiosClient.put(`/admin/questions/${id}`, payload);
  },
  deleteQuestion(id) {
    return axiosClient.delete(`/admin/questions/${id}`);
  },
  importQuestions(payload) {
    return axiosClient.post('/admin/questions/import', payload);
  },

  // Tests
  listTests(params) {
    return axiosClient.get('/admin/tests', { params: buildQuery(params) });
  },
  getTest(id) {
    return axiosClient.get(`/admin/tests/${id}`);
  },
  createTest(payload) {
    return axiosClient.post('/admin/tests', payload);
  },
  updateTest(id, payload) {
    return axiosClient.put(`/admin/tests/${id}`, payload);
  },
  deleteTest(id) {
    return axiosClient.delete(`/admin/tests/${id}`);
  },
};
