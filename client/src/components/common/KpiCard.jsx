import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const VARIANTS = {
  primary: {
    border: 'border-primary-200 bg-primary-50/30',
    icon: 'bg-primary-100 text-primary-600',
  },
  secondary: {
    border: 'border-secondary-200 bg-secondary-50/30',
    icon: 'bg-secondary-100 text-secondary-600',
  },
  tertiary: {
    border: 'border-tertiary-200 bg-tertiary-50/30',
    icon: 'bg-tertiary-100 text-tertiary-600',
  },
  violet: {
    border: 'border-violet-200 bg-violet-50/30',
    icon: 'bg-violet-100 text-violet-600',
  },
  orange: {
    border: 'border-orange-200 bg-orange-50/30',
    icon: 'bg-orange-100 text-orange-600',
  },
  plain: {
    border: '',
    icon: 'bg-slate-100 text-slate-600',
  },
};

/**
 * Generic KPI metric card. Used across Dashboard, Statistics, History.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon  Lucide icon component
 * @param {'primary'|'secondary'|'tertiary'|'violet'|'orange'|'plain'} [props.color='primary']
 * @param {string} props.label   Top label, eg "Bài đã làm"
 * @param {string|number} props.value
 * @param {string} [props.unit]  Eg "phút", "câu"
 * @param {string} [props.sub]   Sub-text below value
 * @param {number} [props.change]  Delta vs prev period (positive/negative).
 *                                  Mặc định hiển thị suffix `%`; pass `changeUnit`
 *                                  để đổi sang "bài"/"câu"/... (delta tuyệt đối).
 * @param {string} [props.changeUnit='%']  Đơn vị hiển thị sau số change.
 * @param {boolean} [props.bordered=true] Use colored border (false = plain card)
 */
export function KpiCard({
  icon: Icon,
  color = 'primary',
  label,
  value,
  unit,
  sub,
  change,
  changeUnit = '%',
  bordered = true,
  className,
}) {
  const variant = VARIANTS[color] || VARIANTS.primary;
  const suffix = changeUnit === '%' ? '%' : ` ${changeUnit}`;
  return (
    <Card
      className={cn(
        'p-4',
        bordered && `border-2 ${variant.border}`,
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', variant.icon)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
        {change !== null && change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              change > 0 ? 'text-secondary-600' : change < 0 ? 'text-red-600' : 'text-slate-400',
            )}
          >
            {change > 0 && <TrendingUp className="w-3 h-3" />}
            {change < 0 && <TrendingDown className="w-3 h-3" />}
            {change > 0 ? '+' : ''}
            {typeof change === 'number' ? change.toLocaleString('vi-VN') : change}
            {suffix}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Card>
  );
}
