import axiosClient from './axiosClient.js';

// OpenAI call ~8-10s, buffer up to 60s
const AI_TIMEOUT = 60000;

export const aiService = {
  /**
   * Sinh hoặc sinh lại phân tích AI cho 1 kết quả bài làm.
   * BE xóa analysis cũ (nếu có) rồi gọi OpenAI mới — rate-limit 5/giờ/user.
   * Áp dụng cho cả Full Test và Practice.
   */
  analyze(resultId) {
    // Body rỗng nhưng phải là {} (không phải null) — Express body-parser strict
    // mode từ chối JSON primitive như "null", chỉ accept object/array.
    return axiosClient.post(`/ai/analyze/${resultId}`, {}, { timeout: AI_TIMEOUT });
  },

  /**
   * Lấy phân tích AI đã có (lazy-generate nếu chưa có).
   * Dùng khi muốn xem lại analysis cũ. Nếu chưa có sẽ tự sinh — chậm.
   */
  get(resultId) {
    return axiosClient.get(`/ai/analysis/${resultId}`, { timeout: AI_TIMEOUT });
  },
};
