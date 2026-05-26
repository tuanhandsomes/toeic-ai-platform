import Joi from 'joi';

/**
 * Joi schema mật khẩu mạnh — dùng chung cho register, change-password,
 * reset-password, admin create user, admin reset password.
 *
 * Quy tắc:
 *   - 8-72 ký tự (72 là giới hạn cứng của bcrypt — vượt sẽ bị truncate âm thầm)
 *   - Có chữ HOA (A-Z)
 *   - Có chữ thường (a-z)
 *   - Có số (0-9)
 *   - Có ký tự đặc biệt (bất kỳ ký tự nào không phải chữ cái / số)
 *
 * Implementation: regex lookahead positive cho 4 nhóm ký tự, length check
 * tách riêng để message lỗi cụ thể hơn.
 */
export const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
  .required()
  .messages({
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
    'string.max': 'Mật khẩu không được dài quá 72 ký tự',
    'string.pattern.base':
      'Mật khẩu phải có đủ: chữ HOA, chữ thường, số và ký tự đặc biệt',
    'any.required': 'Mật khẩu không được trống',
    'string.empty': 'Mật khẩu không được trống',
  });
