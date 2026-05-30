import dns from "node:dns/promises";
import { emailService } from "./emailService.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/**
 * Kiểm tra domain email có MX record không.
 *
 * - Có MX → domain thực sự nhận được mail → cho qua
 * - Không có MX (NODATA / ENOTFOUND) → reject là email không tồn tại
 * - Timeout / DNS lỗi mạng khác → bỏ qua check (không chặn oan user thật)
 *
 * KHÔNG verify được email cá nhân có tồn tại trong domain đó (vd
 * fake-name@gmail.com sẽ qua vì gmail.com có MX). Để chống case này
 * cần OTP verification — out-of-scope cho form contact public.
 */
async function hasMxRecord(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (err) {
    if (err?.code === "ENOTFOUND" || err?.code === "ENODATA") {
      return false; // chắc chắn domain không tồn tại / không có mail
    }
    logger.warn("MX lookup failed (transient) — skipping check", {
      domain,
      code: err?.code,
    });
    return true; // lỗi mạng → fail-open, không chặn oan
  }
}

/**
 * Gửi tin nhắn từ form Liên hệ trên Landing Page tới owner.
 */
async function send({ name, email, message }) {
  // Tầng phòng thủ #1: chặn domain không tồn tại (gmail.com → có, fake.zzz → không)
  const domain = String(email).toLowerCase().split("@")[1];
  if (domain) {
    const valid = await hasMxRecord(domain);
    if (!valid) {
      throw ApiError.badRequest(
        "Email này có vẻ không tồn tại. Vui lòng kiểm tra lại địa chỉ.",
      );
    }
  }

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
