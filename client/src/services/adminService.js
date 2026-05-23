import axiosClient from './axiosClient.js';

const buildQuery = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  );
  return Object.keys(clean).length ? clean : undefined;
};

export const adminService = {
  // ─── Stats + Users still live under /admin/* ─────────────────────────────
  stats() {
    return axiosClient.get('/admin/stats');
  },

  listUsers(params) {
    return axiosClient.get('/admin/users', { params: buildQuery(params) });
  },
  toggleUserLock(id, isActive) {
    return axiosClient.patch(`/admin/users/${id}/lock`, { isActive });
  },

  // ─── Questions moved to /questions (admin-only by route middleware) ──────
  listQuestions(params) {
    return axiosClient.get('/questions', { params: buildQuery(params) });
  },
  getQuestion(id) {
    return axiosClient.get(`/questions/${id}`);
  },
  createQuestion(payload) {
    return axiosClient.post('/questions', payload);
  },
  updateQuestion(id, payload) {
    return axiosClient.put(`/questions/${id}`, payload);
  },
  deleteQuestion(id) {
    return axiosClient.delete(`/questions/${id}`);
  },
  importQuestions(payload) {
    return axiosClient.post('/questions/import', payload);
  },

  // ─── Tests moved to /tests with adminView=true for unpublished + populate ─
  listTests(params) {
    return axiosClient.get('/tests', {
      params: buildQuery({ ...params, adminView: 'true' }),
    });
  },
  getTest(id) {
    return axiosClient.get(`/tests/${id}`, { params: { adminView: 'true' } });
  },
  createTest(payload) {
    return axiosClient.post('/tests', payload);
  },
  updateTest(id, payload) {
    return axiosClient.put(`/tests/${id}`, payload);
  },
  deleteTest(id) {
    return axiosClient.delete(`/tests/${id}`);
  },
};
