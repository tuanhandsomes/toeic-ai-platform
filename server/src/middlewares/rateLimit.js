import rateLimit from "express-rate-limit";

/**
 * Rate limiters cho các nhóm endpoint khác nhau.
 * Lưu ý production: app.js phải set `app.set('trust proxy', 1)` để
 * express-rate-limit lấy đúng client IP từ X-Forwarded-For (Render/Vercel proxy).
 *
 * Khi rate-limit trigger, trả 429 với body theo format ApiError chung
 * để FE handle giống các error khác.
 */

const rateLimitHandler = (_req, res /* , _next, options */) => {
  res.status(429).json({
    success: false,
    message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
  });
};

// Message riêng cho /ai/* — nói rõ giới hạn chung cho mọi bài (không phải per Part/đề)
const aiRateLimitHandler = (_req, res) => {
  res.status(429).json({
    success: false,
    message:
      "Bạn đã yêu cầu phân tích AI 5 lần trong 1 giờ qua (giới hạn chung cho mọi bài, không tính riêng từng Part hay đề). Vui lòng thử lại sau khoảng 1 giờ.",
  });
};

/**
 * /auth/* — chống brute-force login/register/forgot-password.
 * 10 request / 1 phút / IP. Đủ thoáng cho user vừa login vừa typo password,
 * vẫn chặn được bot dò mật khẩu (bot thường >100 req/phút).
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * /ai/* — bảo vệ chi phí OpenAI khỏi user spam.
 * 5 request / 1 giờ / user (key theo userId nếu đã auth, fallback IP).
 * Khớp đúng spec §8.3 "tối đa 5 lần phân tích/giờ/user".
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: aiRateLimitHandler,
});

/**
 * /contact — public form, chống spam.
 * 3 request / 10 phút / IP. Đủ cho user retry nếu typo, đủ chặn bot spam form.
 */
export const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message:
        'Bạn đã gửi quá nhiều tin nhắn liên hệ trong thời gian ngắn. Vui lòng thử lại sau khoảng 10 phút.',
    });
  },
});

/**
 * Defense-in-depth cho mọi endpoint còn lại.
 * 200 request / 1 phút / IP. Một user bình thường không bao giờ chạm ngưỡng này.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
