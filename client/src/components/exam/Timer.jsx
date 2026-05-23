import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { formatTime } from '../../utils/formatTime.js';

/**
 * Timer component supporting 2 modes:
 *
 * 'countdown' (mặc định, dùng cho Full Test):
 *   - Đếm ngược từ durationSec → 0
 *   - Gọi onExpire khi về 0 (auto-submit)
 *   - Highlight warning < 10 phút, critical < 3 phút
 *
 * 'elapsed' (dùng cho Practice — user thoải mái thời gian):
 *   - Đếm tăng từ 0
 *   - KHÔNG gọi onExpire
 *   - Style trung tính (không warning)
 */
export default function Timer({ durationSec, startedAt, onExpire, mode = 'countdown' }) {
  const [seconds, setSeconds] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    return mode === 'countdown' ? Math.max(0, durationSec - elapsed) : elapsed;
  });
  const expiredRef = useRef(false);

  useEffect(() => {
    if (mode === 'countdown' && seconds <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const next = mode === 'countdown' ? Math.max(0, durationSec - elapsed) : elapsed;
      setSeconds(next);
      if (mode === 'countdown' && next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [durationSec, startedAt, onExpire, mode, seconds]);

  let color;
  let label;
  if (mode === 'countdown') {
    const minutesLeft = Math.floor(seconds / 60);
    const isCritical = minutesLeft < 3;
    const isWarning = !isCritical && minutesLeft < 10;
    color = isCritical
      ? 'text-red-600 bg-red-50 animate-pulse'
      : isWarning
        ? 'text-tertiary-600 bg-tertiary-50'
        : 'text-primary-600 bg-primary-50';
    label = 'Còn lại';
  } else {
    color = 'text-slate-600 bg-slate-100';
    label = 'Đã làm';
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${color}`}
      title={mode === 'elapsed' ? 'Thời gian đã làm bài' : 'Thời gian còn lại'}
    >
      <Clock className="w-5 h-5" />
      <span className="text-xs font-sans font-normal opacity-70 mr-1">{label}</span>
      {formatTime(seconds)}
    </div>
  );
}
