import { emailService } from "./emailService.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/**
 * Gửi tin nhắn từ form Liên hệ trên Landing Page tới owner.
 * Throw 503 nếu CONTACT_RECIPIENT chưa cấu hình hoặc Resend trả lỗi,
 * để FE hiển thị fallback message rõ ràng cho user.
 */
async function send({ name, email, message }) {
  const ok = await emailService.sendContactMessage({ name, email, message });
  if (!ok) {
    logger.warn("Contact send failed — fell back to error response", { email });
    throw ApiError.internal(
      "Không gửi được tin nhắn lúc này. Vui lòng thử lại sau.",
    );
  }
  return { sent: true };
}

export const contactService = {
  send,
};
