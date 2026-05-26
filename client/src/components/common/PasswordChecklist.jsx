import { Check, X } from 'lucide-react';
import { checkPassword } from '@/utils/passwordRules';
import { cn } from '@/lib/utils';

/**
 * Hiển thị danh sách rule mật khẩu kèm checkmark live khi user gõ.
 * Ẩn nếu value rỗng (chưa muốn show khi field còn trống — tránh đỏ rực màn hình).
 *
 * Props:
 *   value: string — giá trị mật khẩu hiện tại
 *   className: thêm class tuỳ chỉnh wrapper (vd: thay margin)
 */
export default function PasswordChecklist({ value = '', className }) {
  if (!value) return null;
  const rules = checkPassword(value);

  return (
    <ul className={cn('mt-2 space-y-1 text-xs', className)}>
      {rules.map((r) => (
        <li
          key={r.id}
          className={cn(
            'flex items-center gap-1.5',
            r.met ? 'text-secondary-700' : 'text-slate-500',
          )}
        >
          {r.met ? (
            <Check className="w-3.5 h-3.5 shrink-0 text-secondary-600" />
          ) : (
            <X className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          )}
          <span>{r.label}</span>
        </li>
      ))}
    </ul>
  );
}
