export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format thời lượng cho UI lịch sử / kết quả. Tự động co cụm theo độ lớn,
 * chỉ hiển thị tối đa 2 đơn vị liền kề để gọn:
 *   - < 1 phút  → "45s"
 *   - < 1 giờ   → "12p 30s" hoặc "12p"
 *   - < 1 ngày  → "2h 15p" hoặc "2h"
 *   - ≥ 1 ngày  → "3d 19h" hoặc "3d"
 */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;

  const minutes = Math.floor(s / 60);
  if (minutes < 60) {
    const seconds = s % 60;
    return seconds === 0 ? `${minutes}p` : `${minutes}p ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remMinutes = minutes % 60;
    return remMinutes === 0 ? `${hours}h` : `${hours}h ${remMinutes}p`;
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours === 0 ? `${days}d` : `${days}d ${remHours}h`;
}
