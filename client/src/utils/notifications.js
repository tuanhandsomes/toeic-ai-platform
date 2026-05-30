import {
  AlertCircle,
  Flame,
  Sparkles,
  ClipboardCheck,
  Target,
  Trophy,
  Crown,
  Brain,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { computeCurrentStreak } from '@/utils/statsHelpers';

const DAY_MS = 24 * 60 * 60 * 1000;
const INACTIVE_DAYS_THRESHOLD = 3; // ≥ 3 ngày không làm → nhắc
const STREAK_CELEBRATE_THRESHOLD = 3; // ≥ 3 ngày liên tiếp → khen
const NEAR_GOAL_POINTS = 50; // < 50 điểm là gần mục tiêu
const NEW_TESTS_WINDOW_DAYS = 7; // đề thêm trong 7 ngày qua

const READ_KEY = (userId) => `notif-read:${userId || 'anon'}`;

/**
 * Đọc/ghi danh sách ID đã đọc trong localStorage (per-user).
 * Notification ID là stable key dạng "streak:5", "new-tests:3:abc",
 * "inactive:5", v.v. — sinh từ data hiện tại.
 */
export function getReadIds(userId) {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY(userId)) || '[]'));
  } catch {
    return new Set();
  }
}

export function persistReadIds(userId, set) {
  try {
    localStorage.setItem(READ_KEY(userId), JSON.stringify([...set]));
  } catch {
    /* quota / disabled storage — bỏ qua */
  }
}

/**
 * Mô tả thời gian tương đối tiếng Việt — "vừa xong", "2 giờ trước", "3 ngày trước".
 */
export function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

/**
 * Format ngày giờ cụ thể tiếng Việt cho các thông báo cần mốc thời gian chính xác:
 *   - Hôm nay → "Hôm nay, HH:mm"
 *   - Hôm qua → "Hôm qua, HH:mm"
 *   - < 7 ngày → "Thứ Hai, HH:mm" / "Thứ Ba, HH:mm" / ...
 *   - Khác → "DD/MM/YYYY, HH:mm"
 */
const WEEKDAYS_VI = [
  'Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy',
];

export function formatDateTimeVi(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const time = `${hh}:${mm}`;

  const startOfDay = (x) => {
    const c = new Date(x);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
  };
  const diffDays = Math.floor((startOfDay(now) - startOfDay(d)) / DAY_MS);

  if (diffDays === 0) return `Hôm nay, ${time}`;
  if (diffDays === 1) return `Hôm qua, ${time}`;
  if (diffDays > 1 && diffDays < 7) return `${WEEKDAYS_VI[d.getDay()]}, ${time}`;

  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo}/${d.getFullYear()}, ${time}`;
}

/**
 * Build danh sách thông báo từ dữ liệu hiện có (results + tests + user).
 *
 * Logic thuần client-side, không cần BE — derive từ data đã fetch.
 * Mỗi thông báo có { id (stable key), icon, iconColor, title, description,
 * time?, to? } để render link click-through.
 *
 * @param {Object} params
 * @param {Array} params.results - Bài làm gần nhất (sort mới nhất trước)
 * @param {Array} params.tests   - Danh sách đề thi (có createdAt)
 * @param {Object} params.user   - { targetScore }
 */
export function buildNotifications({ results = [], tests = [], user = {} }) {
  const notifications = [];
  const now = Date.now();

  // 1) Đề thi mới trong tuần qua — mỗi đề 1 thông báo riêng (cap 5 đề mới nhất
  //    để tránh spam dropdown khi admin import bulk).
  const recentTests = tests
    .filter((t) => {
      if (!t.createdAt) return false;
      return (
        now - new Date(t.createdAt).getTime() < NEW_TESTS_WINDOW_DAYS * DAY_MS
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  recentTests.forEach((t) => {
    notifications.push({
      id: `new-test:${t._id}`,
      icon: Sparkles,
      iconColor: 'text-primary-600 bg-primary-100',
      title: 'Có đề thi mới',
      description: `${t.title} đã được thêm vào hệ thống.`,
      time: formatDateTimeVi(t.createdAt),
      to: `/tests/${t._id}`,
    });
  });

  // 2) Nhắc luyện tập khi nghỉ lâu
  const latestResult = results[0];
  if (latestResult) {
    const daysInactive = Math.floor(
      (now - new Date(latestResult.submittedAt).getTime()) / DAY_MS,
    );
    if (daysInactive >= INACTIVE_DAYS_THRESHOLD) {
      notifications.push({
        id: `inactive:${daysInactive}`,
        icon: AlertCircle,
        iconColor: 'text-orange-600 bg-orange-100',
        title: `Đã ${daysInactive} ngày bạn chưa luyện tập`,
        description: 'Quay lại học vài câu để giữ phong độ nhé.',
        time: `Bài gần nhất ${timeAgo(latestResult.submittedAt).toLowerCase()}`,
        to: ROUTES.PRACTICE,
      });
    }
  } else {
    // Chưa từng làm bài
    notifications.push({
      id: 'no-results',
      icon: ClipboardCheck,
      iconColor: 'text-primary-600 bg-primary-100',
      title: 'Hãy thử bài luyện tập đầu tiên',
      description: 'Chọn một Part bất kỳ để bắt đầu hành trình TOEIC của bạn.',
      to: ROUTES.PRACTICE,
    });
  }

  // 3) Khen chuỗi học tập
  const streak = computeCurrentStreak(results);
  if (streak >= STREAK_CELEBRATE_THRESHOLD) {
    notifications.push({
      id: `streak:${streak}`,
      icon: Flame,
      iconColor: 'text-orange-600 bg-orange-100',
      title: `Chuỗi ${streak} ngày liên tiếp 🔥`,
      description: 'Bạn đang giữ phong độ rất tốt — đừng phá chuỗi nhé!',
      to: ROUTES.STATISTICS,
    });
  }

  // 4) Gợi ý Full Test khi chưa có
  const hasFullTest = results.some(
    (r) => r.testType === 'full' && r.scoreTotal > 0,
  );
  if (!hasFullTest && results.length > 0) {
    notifications.push({
      id: 'no-full-test',
      icon: ClipboardCheck,
      iconColor: 'text-secondary-600 bg-secondary-100',
      title: 'Thử Full Test để biết điểm hiện tại',
      description: 'Mô phỏng 200 câu, 120 phút — chuẩn như đề thi thật.',
      to: ROUTES.FULL_TEST,
    });
  }

  // 5a) Đã đạt mục tiêu (mutex với 5b)
  const fullResult = results.find(
    (r) => r.testType === 'full' && r.scoreTotal > 0,
  );
  const latestFullScore = fullResult?.scoreTotal;
  const target = user?.targetScore || 0;
  if (latestFullScore && target && latestFullScore >= target) {
    notifications.push({
      id: `goal-reached:${latestFullScore}:${target}`,
      icon: Trophy,
      iconColor: 'text-amber-600 bg-amber-100',
      title: `Chúc mừng! Bạn đã đạt mục tiêu ${target}`,
      description: `Điểm gần nhất ${latestFullScore} — hãy đặt mục tiêu cao hơn để tiếp tục thử thách.`,
      to: ROUTES.PROFILE,
    });
  } else if (
    latestFullScore &&
    target &&
    target - latestFullScore < NEAR_GOAL_POINTS &&
    target - latestFullScore > 0
  ) {
    // 5b) Gần đạt mục tiêu
    notifications.push({
      id: `near-goal:${latestFullScore}:${target}`,
      icon: Target,
      iconColor: 'text-secondary-600 bg-secondary-100',
      title: `Chỉ còn ${target - latestFullScore} điểm nữa là đạt mục tiêu!`,
      description: `Điểm gần nhất: ${latestFullScore} / mục tiêu ${target}.`,
      to: ROUTES.STATISTICS,
    });
  }

  // 6) Kỷ lục cá nhân mới — Full Test mới nhất cao hơn mọi lần trước
  const fullTests = results.filter(
    (r) => r.testType === 'full' && r.scoreTotal > 0,
  );
  if (fullTests.length >= 2) {
    const latest = fullTests[0];
    const previousMax = Math.max(
      ...fullTests.slice(1).map((r) => r.scoreTotal),
    );
    if (latest.scoreTotal > previousMax) {
      notifications.push({
        id: `personal-best:${latest._id}`,
        icon: Crown,
        iconColor: 'text-amber-600 bg-amber-100',
        title: `Kỷ lục cá nhân mới: ${latest.scoreTotal} điểm 👑`,
        description: `Vượt qua kỷ lục cũ ${previousMax} điểm. Tuyệt vời!`,
        time: timeAgo(latest.submittedAt),
        to: `/results/${latest._id}`,
      });
    }
  }

  // 7) Phân tích AI mới sẵn sàng — Full Test trong 7 ngày qua
  //    BE auto-trigger AI analysis sau khi submit Full Test (memory).
  const recentFullTest = results.find(
    (r) =>
      r.testType === 'full' &&
      r.scoreTotal > 0 &&
      now - new Date(r.submittedAt).getTime() < 7 * DAY_MS,
  );
  if (recentFullTest) {
    notifications.push({
      id: `ai-ready:${recentFullTest._id}`,
      icon: Brain,
      iconColor: 'text-violet-600 bg-violet-100',
      title: 'Phân tích AI mới đã sẵn sàng',
      description: `Xem điểm mạnh/yếu cho "${
        recentFullTest.testId?.title || 'bài Full Test gần nhất'
      }".`,
      time: timeAgo(recentFullTest.submittedAt),
      to: `/results/${recentFullTest._id}`,
    });
  }

  return notifications;
}
