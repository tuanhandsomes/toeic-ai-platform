import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let _resend = null;

/**
 * Lazy singleton Resend client. Returns null if RESEND_API_KEY missing —
 * caller logs + skips (we don't fail the whole request just because email
 * is misconfigured; for forgot-password we still want the DB token to be
 * created so dev can read it from logs).
 */
function getResendClient() {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

/**
 * Send a transactional email. Returns true/false (does not throw on send
 * failure; we log + degrade gracefully).
 *
 * @param {Object} params
 * @param {string} params.to       - Recipient email
 * @param {string} params.subject  - Email subject line
 * @param {string} params.html     - HTML body (used by clients)
 * @param {string} [params.text]   - Plain-text fallback
 */
async function send({ to, subject, html, text }) {
  const client = getResendClient();
  if (!client) {
    logger.warn('Email skipped: RESEND_API_KEY not set', { to, subject });
    return false;
  }

  try {
    const { data, error } = await client.emails.send({
      from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      logger.error('Resend send error', { to, subject, err: error.message || error });
      return false;
    }
    logger.info('Email sent', { to, subject, id: data?.id });
    return true;
  } catch (err) {
    logger.error('Resend send threw', { to, subject, err: err.message });
    return false;
  }
}

/**
 * Reset password email. Branded but minimal — link uses CLIENT_URL so it
 * works in both local dev and deployed environments.
 */
async function sendPasswordReset({ to, fullName, token }) {
  const link = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const greeting = fullName ? `Xin chào ${fullName},` : 'Xin chào,';

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
      <h1 style="color: #4F46E5; font-size: 22px; margin: 0 0 16px;">Đặt lại mật khẩu</h1>
      <p>${greeting}</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TOEIC AI Platform của bạn.</p>
      <p>Bấm vào nút dưới đây để tạo mật khẩu mới. Liên kết có hiệu lực trong <strong>30 phút</strong>.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${link}" style="background: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="font-size: 13px; color: #64748b;">Nếu nút không hoạt động, copy đường link sau và dán vào trình duyệt:</p>
      <p style="font-size: 13px; word-break: break-all; color: #4F46E5;">${link}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
  `;

  const text = `${greeting}\n\nĐặt lại mật khẩu TOEIC AI Platform: ${link}\nLiên kết có hiệu lực 30 phút.\n\nNếu không phải bạn yêu cầu, bỏ qua email này.`;

  return send({
    to,
    subject: 'Đặt lại mật khẩu — TOEIC AI Platform',
    html,
    text,
  });
}

export const emailService = {
  send,
  sendPasswordReset,
};
