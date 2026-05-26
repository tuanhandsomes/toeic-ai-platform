import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

// 401 from these endpoints means wrong credentials / invalid refresh token,
// NOT an expired access token — skip the refresh-and-retry flow.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
const isAuthEndpoint = (url = '') => AUTH_PATHS.some((p) => url.includes(p));

// Redirect tới /login kèm reason để Login page hiển thị message thân thiện
// thay vì để user bối rối với raw error từ BE.
function redirectToLogin(reason = 'session-expired') {
  localStorage.clear();
  // Tránh redirect loop nếu user đã đang ở /login
  if (window.location.pathname !== '/login') {
    window.location.href = `/login?reason=${reason}`;
  }
}

// Trích xuất body lỗi tiếng Việt từ BE (shape {success, message, details}).
// Fallback về error gốc nếu không có response (network error, timeout, ...).
// MỌI chỗ reject trong file này PHẢI đi qua hàm này để FE không nhận raw
// axios Error có .message kiểu "Request failed with status code 401".
const extractError = (err) => err?.response?.data || err;

// Error chung khi phiên đăng nhập kết thúc (refresh token revoked/expired/missing).
// Dùng thay cho BE message technical (vd: "Refresh token đã bị thu hồi") vì
// trong context UI thường thì user không quan tâm chi tiết đó — chỉ cần biết
// đang được chuyển về login. BE message đúng vẫn nằm trong console log.
const SESSION_EXPIRED_ERROR = {
  success: false,
  message: "Phiên đăng nhập đã kết thúc. Đang chuyển về trang đăng nhập…",
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest?.url)
    ) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        redirectToLogin('session-expired');
        return Promise.reject(SESSION_EXPIRED_ERROR);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
        // Lưu ý: KHÔNG dùng `.catch(Promise.reject)` ở đây — passing
        // `Promise.reject` không bound `this` → V8 throw "PromiseReject called
        // on non-object". Promise chain auto-propagate rejection nên không
        // cần catch ở đây cũng đúng.
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        );
        const newAccessToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        refreshQueue.forEach((p) => p.resolve(newAccessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        // Refresh fail → phiên đã kết thúc. Reject mọi request đang chờ
        // bằng SESSION_EXPIRED_ERROR (message thân thiện) thay vì leak BE
        // message technical kiểu "Refresh token đã bị thu hồi" ra UI.
        // BE message gốc vẫn log để debug.
        console.warn("[auth] refresh failed:", extractError(refreshErr));
        refreshQueue.forEach((p) => p.reject(SESSION_EXPIRED_ERROR));
        refreshQueue = [];
        redirectToLogin('session-expired');
        return Promise.reject(SESSION_EXPIRED_ERROR);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(extractError(error));
  },
);

export default axiosClient;
