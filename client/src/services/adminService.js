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
  getUser(id) {
    return axiosClient.get(`/admin/users/${id}`);
  },
  getUserResults(id, params) {
    return axiosClient.get(`/admin/users/${id}/results`, {
      params: buildQuery(params),
    });
  },
  createUser(payload) {
    return axiosClient.post('/admin/users', payload);
  },
  updateUser(id, payload) {
    return axiosClient.patch(`/admin/users/${id}`, payload);
  },
  deleteUser(id) {
    return axiosClient.delete(`/admin/users/${id}`);
  },
  toggleUserLock(id, isActive) {
    return axiosClient.patch(`/admin/users/${id}/lock`, { isActive });
  },
  resetUserPassword(id, newPassword) {
    return axiosClient.patch(`/admin/users/${id}/reset-password`, { newPassword });
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

  /**
   * Import a full test bundle (testInfo + 200 questions) in one shot.
   * BE creates Full Test + 7 Practice Sets + inserts questions with
   * audio/image URLs auto-filled per naming convention.
   */
  importTestBundle(bundle) {
    return axiosClient.post('/tests/import', bundle);
  },

  /**
   * Bulk upload audio + image files for a specific test.
   * Files are auto-linked to questions in this test by filename convention.
   *
   * @param {string} testId
   * @param {File[]} files     - Array of File objects from <input type="file" multiple>
   * @param {(p: number) => void} [onProgress]  - 0-100 callback
   */
  uploadTestMedia(testId, files, onProgress) {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return axiosClient.post(`/tests/${testId}/upload-media`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // 10 phút — đủ cho cả mạng yếu + BE phải process song song nhiều file
      timeout: 600000,
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  },
};
