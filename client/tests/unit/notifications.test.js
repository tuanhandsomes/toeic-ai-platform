import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildNotifications,
  getReadIds,
  persistReadIds,
  timeAgo,
  formatDateTimeVi,
} from '../../src/utils/notifications.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysAgo = (n) => {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
};
const minutesAgoIso = (m) => new Date(Date.now() - m * 60_000).toISOString();

beforeEach(() => {
  localStorage.clear();
});

describe('getReadIds + persistReadIds', () => {
  it('returns empty Set when nothing stored', () => {
    expect(getReadIds('u1').size).toBe(0);
  });

  it('persists and retrieves round-trip', () => {
    persistReadIds('u1', new Set(['a', 'b']));
    const out = getReadIds('u1');
    expect(out.has('a')).toBe(true);
    expect(out.has('b')).toBe(true);
  });

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('notif-read:u1', 'not-json');
    expect(getReadIds('u1').size).toBe(0);
  });

  it('keys by userId — different users isolated', () => {
    persistReadIds('u1', new Set(['a']));
    persistReadIds('u2', new Set(['b']));
    expect(getReadIds('u1').has('a')).toBe(true);
    expect(getReadIds('u1').has('b')).toBe(false);
  });
});

describe('timeAgo', () => {
  it('"Vừa xong" for < 1 minute', () => {
    expect(timeAgo(new Date())).toBe('Vừa xong');
  });
  it('"N phút trước" for 1-59 mins', () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60_000))).toBe('5 phút trước');
  });
  it('"N giờ trước" for 1-23 hours', () => {
    expect(timeAgo(new Date(Date.now() - 3 * 60 * 60_000))).toBe('3 giờ trước');
  });
  it('"N ngày trước"', () => {
    expect(timeAgo(daysAgo(2))).toMatch(/2 ngày trước/);
  });
  it('returns "" for empty input', () => {
    expect(timeAgo(null)).toBe('');
  });
});

describe('formatDateTimeVi', () => {
  it('"Hôm nay, HH:mm" for today', () => {
    expect(formatDateTimeVi(new Date())).toMatch(/^Hôm nay, \d{2}:\d{2}$/);
  });
  it('"Hôm qua, HH:mm" for yesterday', () => {
    expect(formatDateTimeVi(daysAgo(1))).toMatch(/^Hôm qua, \d{2}:\d{2}$/);
  });
  it('weekday label for 2-6 days ago', () => {
    expect(formatDateTimeVi(daysAgo(3))).toMatch(
      /^(Chủ nhật|Thứ Hai|Thứ Ba|Thứ Tư|Thứ Năm|Thứ Sáu|Thứ Bảy), \d{2}:\d{2}$/,
    );
  });
  it('DD/MM/YYYY for older dates', () => {
    expect(formatDateTimeVi(daysAgo(60))).toMatch(
      /^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/,
    );
  });
});

describe('buildNotifications — empty input', () => {
  it('returns "no-results" notification when no results exist', () => {
    const out = buildNotifications({ results: [], tests: [], user: {} });
    const ids = out.map((n) => n.id);
    expect(ids).toContain('no-results');
  });
});

describe('buildNotifications — new-test entries', () => {
  it('lists tests created within last 7 days', () => {
    const tests = [
      {
        _id: 't1',
        title: 'New Test 1',
        createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
      },
      {
        _id: 't-old',
        title: 'Old Test',
        createdAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
      },
    ];
    const out = buildNotifications({ results: [], tests, user: {} });
    const ids = out.map((n) => n.id);
    expect(ids).toContain('new-test:t1');
    expect(ids).not.toContain('new-test:t-old');
  });
});

describe('buildNotifications — streak celebration (≥ 3 days)', () => {
  const recentResults = [
    { submittedAt: daysAgo(0).toISOString(), testType: 'part' },
    { submittedAt: daysAgo(1).toISOString(), testType: 'part' },
    { submittedAt: daysAgo(2).toISOString(), testType: 'part' },
  ];

  it('emits "streak:N" when user practiced ≥ 3 consecutive days', () => {
    const out = buildNotifications({
      results: recentResults,
      tests: [],
      user: {},
    });
    const ids = out.map((n) => n.id);
    expect(ids).toContain('streak:3');
  });

  it('does NOT emit streak for 2-day streak', () => {
    const out = buildNotifications({
      results: recentResults.slice(0, 2),
      tests: [],
      user: {},
    });
    const ids = out.map((n) => n.id);
    expect(ids.some((id) => id.startsWith('streak:'))).toBe(false);
  });
});

describe('buildNotifications — inactive reminder', () => {
  it('emits inactive when last result is > 3 days old', () => {
    const out = buildNotifications({
      results: [{ submittedAt: daysAgo(5).toISOString() }],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id.startsWith('inactive:'))).toBe(true);
  });

  it('does not emit inactive when recent activity', () => {
    const out = buildNotifications({
      results: [{ submittedAt: daysAgo(1).toISOString() }],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id.startsWith('inactive:'))).toBe(false);
  });
});

describe('buildNotifications — goal / near-goal (mutex)', () => {
  it('goal-reached when latest Full Test ≥ target', () => {
    const out = buildNotifications({
      results: [
        {
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 850,
        },
      ],
      tests: [],
      user: { targetScore: 800 },
    });
    expect(out.some((n) => n.id.startsWith('goal-reached:'))).toBe(true);
    expect(out.some((n) => n.id.startsWith('near-goal:'))).toBe(false);
  });

  it('near-goal when latest score is within 50 points', () => {
    const out = buildNotifications({
      results: [
        {
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 770,
        },
      ],
      tests: [],
      user: { targetScore: 800 },
    });
    expect(out.some((n) => n.id.startsWith('near-goal:'))).toBe(true);
    expect(out.some((n) => n.id.startsWith('goal-reached:'))).toBe(false);
  });

  it('neither when gap > 50 points', () => {
    const out = buildNotifications({
      results: [
        {
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 600,
        },
      ],
      tests: [],
      user: { targetScore: 800 },
    });
    expect(out.some((n) => n.id.startsWith('goal-reached:'))).toBe(false);
    expect(out.some((n) => n.id.startsWith('near-goal:'))).toBe(false);
  });
});

describe('buildNotifications — personal best', () => {
  it('emits personal-best when latest Full Test beats previous max', () => {
    const out = buildNotifications({
      results: [
        {
          _id: 'r-latest',
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 800,
        },
        {
          _id: 'r-old',
          submittedAt: daysAgo(5).toISOString(),
          testType: 'full',
          scoreTotal: 700,
        },
      ],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id === 'personal-best:r-latest')).toBe(true);
  });

  it('no personal-best when only 1 Full Test exists', () => {
    const out = buildNotifications({
      results: [
        {
          _id: 'r1',
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 800,
        },
      ],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id.startsWith('personal-best:'))).toBe(false);
  });
});

describe('buildNotifications — AI ready (Full Test within 7 days)', () => {
  it('emits ai-ready for recent Full Test', () => {
    const out = buildNotifications({
      results: [
        {
          _id: 'r1',
          submittedAt: new Date().toISOString(),
          testType: 'full',
          scoreTotal: 800,
          testId: { title: 'ETS 2026 — Full Test 04' },
        },
      ],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id === 'ai-ready:r1')).toBe(true);
  });

  it('no ai-ready when Full Test older than 7 days', () => {
    const out = buildNotifications({
      results: [
        {
          _id: 'r1',
          submittedAt: daysAgo(10).toISOString(),
          testType: 'full',
          scoreTotal: 800,
        },
      ],
      tests: [],
      user: {},
    });
    expect(out.some((n) => n.id === 'ai-ready:r1')).toBe(false);
  });
});

describe('buildNotifications — sort by timestamp desc', () => {
  it('newer notifications appear before older ones', () => {
    const tests = [
      {
        _id: 't-old',
        title: 'Old Test',
        createdAt: minutesAgoIso(60 * 24 * 2), // 2 days ago
      },
      {
        _id: 't-new',
        title: 'New Test',
        createdAt: minutesAgoIso(30), // 30 mins ago
      },
    ];
    const out = buildNotifications({ results: [], tests, user: {} });
    const newIdx = out.findIndex((n) => n.id === 'new-test:t-new');
    const oldIdx = out.findIndex((n) => n.id === 'new-test:t-old');
    expect(newIdx).toBeGreaterThan(-1);
    expect(oldIdx).toBeGreaterThan(-1);
    expect(newIdx).toBeLessThan(oldIdx);
  });

  it('AI-ready submitted minutes ago beats new-test created day ago', () => {
    const out = buildNotifications({
      results: [
        {
          _id: 'r1',
          submittedAt: minutesAgoIso(10),
          testType: 'full',
          scoreTotal: 800,
          testId: { title: 'Full Test 04' },
        },
      ],
      tests: [
        { _id: 't1', title: 'Test 1', createdAt: minutesAgoIso(60 * 24) },
      ],
      user: {},
    });
    const aiIdx = out.findIndex((n) => n.id === 'ai-ready:r1');
    const newTestIdx = out.findIndex((n) => n.id === 'new-test:t1');
    expect(aiIdx).toBeLessThan(newTestIdx);
  });
});
