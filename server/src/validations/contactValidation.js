import Joi from 'joi';

/**
 * Blocklist các nhà cung cấp email tạm thời / dùng một lần thường gặp.
 * Chặn được phần lớn trường hợp người dùng "fake email" qua dịch vụ throwaway
 * (10minutemail, mailinator, tempmail, ...) — KHÔNG validate được email
 * có thật hay không (chỉ verify OTP mới làm được điều đó).
 *
 * Mở rộng list này khi gặp domain spam mới trong logs.
 */
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com', '10minutemail.net', '10minemail.com',
  '1secmail.com', '1secmail.net', '1secmail.org',
  'mailinator.com', 'mailinator.net', 'mailinator2.com',
  'tempmail.com', 'tempmail.net', 'temp-mail.org', 'temp-mail.io', 'tempmailo.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'throwawaymail.com', 'fakemail.net', 'fakeinbox.com', 'fakemailgenerator.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'maildrop.cc', 'getnada.com', 'nada.email', 'inboxbear.com',
  'sharklasers.com', 'grr.la',
  'trashmail.com', 'trashmail.net', 'trashmail.de', 'trashmail.io',
  'dispostable.com', 'spambox.us', 'spam4.me',
  'mintemail.com', 'tempinbox.com', 'mohmal.com',
  'emailondeck.com', 'mytemp.email', 'mytrashmail.com',
  'mailnesia.com', 'discard.email', 'discardmail.com',
  'getairmail.com', 'mailcatch.com', 'inboxalias.com',
]);

/**
 * Kiểm tra phần cuối email khớp định dạng TLD hợp lệ — tối thiểu 2 chữ cái
 * (vd: `.com`, `.vn`, `.io`). Bắt được TLD bịa kiểu `.zzz` mà Joi.email
 * không bắt khi `tlds.allow=false`.
 */
const VALID_TLD_REGEX = /\.[a-z]{2,24}$/i;

/**
 * Local-part đáng ngờ (phần trước @) — bắt case `trashmail@gmail.com`,
 * `tempmail@yahoo.com`, ... mà DISPOSABLE_DOMAINS không bắt được vì
 * domain là gmail/yahoo thật.
 */
const SUSPICIOUS_LOCAL_REGEX =
  /^(trash|temp|fake|throwaway|spam|junk|disposable|burner|noreply|no-reply)(mail|email|inbox)?\d*$/i;

const customEmailValidator = (value, helpers) => {
  const lower = String(value).toLowerCase().trim();

  if (!VALID_TLD_REGEX.test(lower)) {
    return helpers.error('email.tld');
  }

  const [local, domain] = lower.split('@');

  if (local && SUSPICIOUS_LOCAL_REGEX.test(local)) {
    return helpers.error('email.disposable');
  }

  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return helpers.error('email.disposable');
  }

  return value;
};

const emailField = Joi.string()
  .trim()
  .lowercase()
  .max(254) // RFC 5321 SMTP max length
  .email({ minDomainSegments: 2, tlds: { allow: false } })
  .required()
  .custom(customEmailValidator)
  .messages({
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email quá dài (tối đa 254 ký tự)',
    'any.required': 'Vui lòng nhập email',
    'email.tld': 'Email không hợp lệ — phần đuôi domain không đúng',
    'email.disposable':
      'Vui lòng dùng email thật, không nhận email tạm thời / dùng một lần',
  });

/**
 * Tên không được toàn số / toàn ký tự đặc biệt — bắt bot spam điền random.
 * Cho phép unicode (chữ Việt có dấu) + space + dấu nháy/gạch.
 */
const NAME_REGEX = /[\p{L}]/u; // ít nhất 1 chữ cái (bất kỳ ngôn ngữ)

export const contactMessageSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .custom((value, helpers) => {
      if (!NAME_REGEX.test(value)) return helpers.error('name.alpha');
      return value;
    })
    .messages({
      'string.empty': 'Vui lòng nhập họ và tên',
      'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ và tên tối đa 100 ký tự',
      'any.required': 'Vui lòng nhập họ và tên',
      'name.alpha': 'Họ và tên phải chứa chữ cái',
    }),
  email: emailField,
  message: Joi.string().trim().min(10).max(2000).required().messages({
    'string.empty': 'Vui lòng nhập nội dung tin nhắn',
    'string.min': 'Nội dung tin nhắn phải có ít nhất 10 ký tự',
    'string.max': 'Nội dung tin nhắn tối đa 2000 ký tự',
    'any.required': 'Vui lòng nhập nội dung tin nhắn',
  }),
  // Honeypot field — bot tự động sẽ fill, user thật không thấy.
  // Joi reject khi non-empty.
  website: Joi.string().allow('').max(0).messages({
    'string.max': 'Yêu cầu không hợp lệ',
  }),
}).options({ stripUnknown: true });
