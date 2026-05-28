import axiosClient from './axiosClient.js';

export const contactService = {
  /**
   * Gửi tin nhắn từ form Liên hệ trên Landing Page tới owner.
   * Public endpoint — không cần auth. Rate-limit 3 req/10 phút/IP ở BE.
   */
  send({ name, email, message }) {
    return axiosClient.post('/contact', { name, email, message });
  },
};
