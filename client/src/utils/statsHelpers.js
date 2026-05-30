/**
 * Helpers tính thống kê 7 ngày dùng chung cho:
 *   - Statistics page (user xem chính mình)
 *   - AdminUserDetail page (admin xem 1 user khác)
 *
 * Output shape phải khớp với KpiCard + ChartContainer hiện có.
 */

const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateMMDD = (date) => {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Build 7 buckets (1 bucket / ngày) cho 1 cửa sổ 7 ngày.
 * @param {Array} results          - List kết quả bài làm (có submittedAt, durationSec, totalQuestions, accuracy)
 * @param {number} [offsetDays=0]  - 0 = tuần hiện tại; 7 = 7 ngày trước đó
 */
export function build7DayBuckets(results, offsetDays = 0) {
  const buckets = [];
  const startDate = new Date(TODAY);
  startDate.setDate(TODAY.getDate() - offsetDays);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() - i);
    buckets.push({
      key: dayKey(d),
      date: d,
      label: formatDateMMDD(d),
      minutes: 0,
      accuracySum: 0,
      questions: 0,
      count: 0,
    });
  }

  const map = new Map(buckets.map((b) => [b.key, b]));
  results.forEach((r) => {
    const b = map.get(dayKey(r.submittedAt));
    if (b) {
      b.minutes += Math.round((r.durationSec || 0) / 60);
      b.questions += r.totalQuestions || 0;
      b.accuracySum += r.accuracy || 0;
      b.count += 1;
    }
  });

  return buckets.map((b) => ({
    ...b,
    avgAccuracy: b.count > 0 ? Math.round(b.accuracySum / b.count) : 0,
  }));
}

/**
 * Đếm số ngày liên tiếp gần nhất user có ít nhất 1 bài làm.
 *
 * Quy tắc:
 *   - Nếu hôm nay có ít nhất 1 bài → bắt đầu đếm từ hôm nay đi ngược.
 *   - Nếu hôm nay chưa có bài nhưng hôm qua có → bắt đầu đếm từ hôm qua
 *     (cho user đang trong streak chưa kịp làm hôm nay, tránh reset oan).
 *   - Khi gặp 1 ngày không có bài thì dừng.
 *
 * @param {Array} results - Bài làm có trường submittedAt
 * @returns {number}      - Số ngày liên tiếp (0 nếu chưa có bài nào)
 */
export function computeCurrentStreak(results) {
  if (!results?.length) return 0;
  const dayKeys = new Set(results.map((r) => dayKey(r.submittedAt)));
  const cursor = new Date(TODAY);
  // Hôm nay chưa làm nhưng hôm qua có → cho phép bắt đầu từ hôm qua.
  if (!dayKeys.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (dayKeys.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const sum = (arr, key) => arr.reduce((s, b) => s + b[key], 0);

function avgPerDay(n) {
  const v = n / 7;
  return v < 10 ? Math.round(v * 10) / 10 : Math.round(v);
}

function formatMinutes(mins) {
  if (mins < 60) return `${mins} phút`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function computeAvgAccuracy(week) {
  const c = sum(week, 'count');
  if (c === 0) return 0;
  const totalAcc = week.reduce((s, b) => s + b.accuracySum, 0);
  return Math.round(totalAcc / c);
}

/**
 * Tính 4 KPI tuần (tests / questions / minutes / accuracy) — value là tổng tuần,
 * sub là TB/ngày, change là delta tuyệt đối so với tuần trước (đơn vị bài/câu/phút/%).
 *
 * @param {Array} results - Kết quả 100 bài gần nhất (đủ cover cả tuần này + tuần trước)
 */
export function computeWeeklyKpis(results) {
  const thisWeek = build7DayBuckets(results, 0);
  const lastWeek = build7DayBuckets(results, 7);

  const dateRange = `${thisWeek[0].label} - ${thisWeek[6].label}`;

  const thisCount = sum(thisWeek, 'count');
  const lastCount = sum(lastWeek, 'count');
  const thisQuestions = sum(thisWeek, 'questions');
  const lastQuestions = sum(lastWeek, 'questions');
  const thisMinutes = sum(thisWeek, 'minutes');
  const lastMinutes = sum(lastWeek, 'minutes');

  const thisAccuracy = computeAvgAccuracy(thisWeek);
  const lastAccuracy = computeAvgAccuracy(lastWeek);

  return {
    dateRange,
    thisWeek,
    lastWeek,
    kpis: {
      tests: {
        value: thisCount,
        sub: `Trung bình ~${avgPerDay(thisCount)} bài/ngày`,
        change: thisCount - lastCount,
        changeUnit: 'bài',
      },
      questions: {
        value: thisQuestions.toLocaleString('vi-VN'),
        sub: `Trung bình ~${avgPerDay(thisQuestions)} câu/ngày`,
        change: thisQuestions - lastQuestions,
        changeUnit: 'câu',
      },
      minutes: {
        value: formatMinutes(thisMinutes),
        sub: `Trung bình ~${formatMinutes(Math.round(thisMinutes / 7))}/ngày`,
        change: thisMinutes - lastMinutes,
        changeUnit: 'phút',
      },
      accuracy: {
        value: thisAccuracy,
        sub: 'Trung bình mỗi bài làm',
        change: thisAccuracy - lastAccuracy,
        changeUnit: '%',
      },
    },
  };
}
