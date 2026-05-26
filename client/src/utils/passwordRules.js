/**
 * Quy tắc mật khẩu — đồng bộ với BE `server/src/validations/passwordRules.js`.
 * Dùng cho live UI feedback: hiển thị checklist từng rule khi user gõ.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Tối thiểu 8 ký tự',
    test: (v) => v.length >= 8,
  },
  {
    id: 'maxLength',
    label: 'Không quá 72 ký tự',
    test: (v) => v.length > 0 && v.length <= 72,
  },
  {
    id: 'uppercase',
    label: 'Có chữ HOA (A-Z)',
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: 'lowercase',
    label: 'Có chữ thường (a-z)',
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: 'digit',
    label: 'Có số (0-9)',
    test: (v) => /[0-9]/.test(v),
  },
  {
    id: 'special',
    label: 'Có ký tự đặc biệt (!@#$...)',
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function checkPassword(value = '') {
  return PASSWORD_RULES.map((r) => ({
    id: r.id,
    label: r.label,
    met: r.test(value),
  }));
}

// Pass tất cả rule → mật khẩu hợp lệ
export function isValidPassword(value = '') {
  return PASSWORD_RULES.every((r) => r.test(value));
}
