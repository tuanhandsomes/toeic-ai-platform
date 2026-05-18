import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../../utils/formatTime.js';

/**
 * Countdown timer.
 *
 * @param {Object} props
 * @param {number} props.durationSec  Total duration in seconds
 * @param {Date}   props.startedAt    When the test started
 * @param {Function} props.onExpire   Called when time hits 0
 */
export default function Timer({ durationSec, startedAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return Math.max(0, durationSec - elapsed);
  });

  const expiredRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const next = Math.max(0, durationSec - elapsed);
      setRemaining(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [durationSec, startedAt, onExpire, remaining]);

  const minutesLeft = Math.floor(remaining / 60);
  const isWarning = minutesLeft < 10;
  const isCritical = minutesLeft < 3;

  const color = isCritical
    ? 'text-red-600 bg-red-50 animate-pulse'
    : isWarning
      ? 'text-tertiary-600 bg-tertiary-50'
      : 'text-primary-600 bg-primary-50';

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${color}`}>
      <Clock className="w-5 h-5" />
      {formatTime(remaining)}
    </div>
  );
}
