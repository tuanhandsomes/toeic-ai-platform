import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  success: { bg: 'bg-secondary-50 border-secondary-200 text-secondary-700', icon: CheckCircle2 },
  error: { bg: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle },
  warning: { bg: 'bg-tertiary-50 border-tertiary-200 text-tertiary-700', icon: AlertTriangle },
  info: { bg: 'bg-primary-50 border-primary-200 text-primary-700', icon: Info },
};

/**
 * Inline status banner — for form feedback, page-level notices.
 *
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} props.variant
 * @param {string} props.message
 * @param {string} [props.className]
 */
export function StatusBanner({ variant = 'info', message, className }) {
  const v = VARIANTS[variant] || VARIANTS.info;
  const Icon = v.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
        v.bg,
        className,
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
