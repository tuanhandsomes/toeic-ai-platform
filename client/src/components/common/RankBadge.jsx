import { Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Visual rank indicator. Uses crown for #1, medal for #2-3, plain number for 4+.
 *
 * @param {Object} props
 * @param {number} props.rank  1-based rank
 * @param {string} [props.className]
 */
export function RankBadge({ rank, className }) {
  if (rank === 1) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white',
          className,
        )}
      >
        <Crown className="w-4 h-4" fill="currentColor" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white',
          className,
        )}
      >
        <Medal className="w-4 h-4" fill="currentColor" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 text-white',
          className,
        )}
      >
        <Medal className="w-4 h-4" fill="currentColor" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm',
        className,
      )}
    >
      {rank}
    </div>
  );
}
