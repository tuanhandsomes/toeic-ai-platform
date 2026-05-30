import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visual rank indicator. Icon medal làm nền, SỐ to đậm chính giữa.
 *   #1 — Trophy   (gold)
 *   #2 — Medal    (silver)
 *   #3 — Award    (bronze)
 *   4+ — chỉ số
 *
 * @param {Object} props
 * @param {number} props.rank  1-based rank
 * @param {string} [props.className]
 */
export function RankBadge({ rank, className }) {
  const TOP = {
    1: {
      Icon: Trophy,
      bg: 'from-yellow-300 to-amber-500',
      ring: 'ring-amber-400/40',
      label: 'Hạng 1',
    },
    2: {
      Icon: Medal,
      bg: 'from-slate-200 to-slate-400',
      ring: 'ring-slate-300/60',
      label: 'Hạng 2',
    },
    3: {
      Icon: Award,
      bg: 'from-orange-400 to-orange-700',
      ring: 'ring-orange-500/40',
      label: 'Hạng 3',
    },
  };

  if (TOP[rank]) {
    const { Icon, bg, ring, label } = TOP[rank];
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center w-10 h-10 rounded-full text-white shadow-sm ring-1 bg-gradient-to-br',
          bg,
          ring,
          className,
        )}
        title={label}
      >
        {/* Icon medal làm nền — opacity nhẹ, kích thước full */}
        <Icon
          className="absolute inset-0 m-auto w-6 h-6 opacity-30"
          strokeWidth={2}
          aria-hidden="true"
        />
        {/* Số rank nổi trên cùng */}
        <span
          className="relative text-base font-bold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
        >
          {rank}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm',
        className,
      )}
    >
      {rank}
    </div>
  );
}
