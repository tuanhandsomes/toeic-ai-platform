import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Input mật khẩu kèm nút ẩn/hiện (icon mắt). Đồng bộ UX cho mọi field password.
 *
 * Modes:
 *   - default: dùng shadcn `Input` (cho admin dialogs, profile form)
 *   - native: dùng <input className="input"> (cho Login/Register/Reset pages)
 *
 * leftIcon: render icon bên trái (vd: Lock). Khi có leftIcon, tự thêm pl-10
 * vào input để chừa chỗ.
 */
const PasswordInput = forwardRef(function PasswordInput(
  { className, native, leftIcon, ...props },
  ref,
) {
  const [show, setShow] = useState(false);
  const iconSize = native ? 'w-5 h-5' : 'w-4 h-4';

  const inputEl = native ? (
    <input
      ref={ref}
      type={show ? 'text' : 'password'}
      className={cn('input pr-10', leftIcon && 'pl-10', className)}
      {...props}
    />
  ) : (
    <Input
      ref={ref}
      type={show ? 'text' : 'password'}
      className={cn('pr-10', leftIcon && 'pl-10', className)}
      {...props}
    />
  );

  return (
    <div className="relative">
      {leftIcon}
      {inputEl}
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff className={iconSize} /> : <Eye className={iconSize} />}
      </button>
    </div>
  );
});

export default PasswordInput;
