import Joi from 'joi';

const emailField = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .required()
  .messages({
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  });

export const contactMessageSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Vui lòng nhập họ và tên',
    'string.min': 'Họ và tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ và tên tối đa 100 ký tự',
    'any.required': 'Vui lòng nhập họ và tên',
  }),
  email: emailField,
  message: Joi.string().trim().min(5).max(2000).required().messages({
    'string.empty': 'Vui lòng nhập nội dung tin nhắn',
    'string.min': 'Nội dung tin nhắn phải có ít nhất 5 ký tự',
    'string.max': 'Nội dung tin nhắn tối đa 2000 ký tự',
    'any.required': 'Vui lòng nhập nội dung tin nhắn',
  }),
});
