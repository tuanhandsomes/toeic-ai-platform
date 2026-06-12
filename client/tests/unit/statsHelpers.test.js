import { describe, it, expect } from 'vitest';
import {
  build7DayBuckets,
  computeCurrentStreak,
  computeWeeklyKpis,
} from '../../src/utils/statsHelpers.js';

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

const result = (overrides) => ({
  submittedAt: daysAgo(0).toISOString(),
  durationSec: 600, // 10 phút
  totalQuestions: 10,
  accuracy: 80,
  testType: 'part',
  scoreTotal: 50,
  ...overrides,
});

describe('build7DayBuckets', () => {
  it('returns 7 buckets in chronological order ending today', () => {
    const buckets = build7DayBuckets([]);
    expect(buckets).toHaveLength(7);
    // Last bucket = today
    const last = buckets[6];
    expect(last.date.toDateString()).toBe(startOfToday().toDateString());
  });

  it('sum minutes correctly across multiple results in same day', () => {
    const today = daysAgo(0).toISOString();
    const buckets = build7DayBuckets([
      result({ submittedAt: today, durationSec: 600 }), // 10p
      result({ submittedAt: today, durationSec: 900 }), // 15p
    ]);
    expect(buckets[6].minutes).toBe(25);
    expect(buckets[6].count).toBe(2);
  });

  it('avgAccuracy = mean across results in the bucket', () => {
    const today = daysAgo(0).toISOString();
    const buckets = build7DayBuckets([
      result({ submittedAt: today, accuracy: 80 }),
      result({ submittedAt: today, accuracy: 60 }),
    ]);
    expect(buckets[6].avgAccuracy).toBe(70);
  });

  it('maxScore tracks highest Full Test score per day (Practice excluded)', () => {
    const today = daysAgo(0).toISOString();
    const buckets = build7DayBuckets([
      result({
        submittedAt: today,
        testType: 'full',
        scoreTotal: 600,
      }),
      result({
        submittedAt: today,
        testType: 'full',
        scoreTotal: 750,
      }),
      result({
        submittedAt: today,
        testType: 'part',
        scoreTotal: 999,
      }),
    ]);
    expect(buckets[6].maxScore).toBe(750);
  });

  it('offsetDays=7 shifts the window 1 week back', () => {
    const sevenDaysAgoIso = daysAgo(7).toISOString();
    const buckets = build7DayBuckets(
      [result({ submittedAt: sevenDaysAgoIso, durationSec: 600 })],
      7,
    );
    // 7 days ago should fall in the last bucket of last week's window
    const hit = buckets.find((b) => b.minutes > 0);
    expect(hit).toBeDefined();
    expect(hit.minutes).toBe(10);
  });

  it('ignores results outside the 7-day window', () => {
    const longAgo = daysAgo(30).toISOString();
    const buckets = build7DayBuckets([result({ submittedAt: longAgo })]);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
  });
});

describe('computeCurrentStreak', () => {
  it('returns 0 with no results', () => {
    expect(computeCurrentStreak([])).toBe(0);
  });

  it('returns 0 when no result in past 2 days', () => {
    expect(
      computeCurrentStreak([
        result({ submittedAt: daysAgo(5).toISOString() }),
      ]),
    ).toBe(0);
  });

  it('returns 1 when only today has a result', () => {
    expect(
      computeCurrentStreak([result({ submittedAt: daysAgo(0).toISOString() })]),
    ).toBe(1);
  });

  it('counts consecutive days back from today', () => {
    expect(
      computeCurrentStreak([
        result({ submittedAt: daysAgo(0).toISOString() }),
        result({ submittedAt: daysAgo(1).toISOString() }),
        result({ submittedAt: daysAgo(2).toISOString() }),
      ]),
    ).toBe(3);
  });

  it('stops at first gap', () => {
    expect(
      computeCurrentStreak([
        result({ submittedAt: daysAgo(0).toISOString() }),
        result({ submittedAt: daysAgo(1).toISOString() }),
        // Day 2 missing
        result({ submittedAt: daysAgo(3).toISOString() }),
      ]),
    ).toBe(2);
  });

  it('allows starting from yesterday if today is empty', () => {
    expect(
      computeCurrentStreak([
        result({ submittedAt: daysAgo(1).toISOString() }),
        result({ submittedAt: daysAgo(2).toISOString() }),
      ]),
    ).toBe(2);
  });
});

describe('computeWeeklyKpis', () => {
  it('returns full shape with this/last week + kpis', () => {
    const out = computeWeeklyKpis([result()]);
    expect(out).toHaveProperty('dateRange');
    expect(out).toHaveProperty('thisWeek');
    expect(out).toHaveProperty('lastWeek');
    expect(out.kpis).toHaveProperty('tests');
    expect(out.kpis).toHaveProperty('questions');
    expect(out.kpis).toHaveProperty('minutes');
    expect(out.kpis).toHaveProperty('accuracy');
  });

  it('KPI shape: value + sub + change + changeUnit', () => {
    const { kpis } = computeWeeklyKpis([result()]);
    Object.values(kpis).forEach((k) => {
      expect(k).toHaveProperty('value');
      expect(k).toHaveProperty('sub');
      expect(k).toHaveProperty('change');
      expect(k).toHaveProperty('changeUnit');
    });
    expect(kpis.tests.changeUnit).toBe('bài');
    expect(kpis.questions.changeUnit).toBe('câu');
    expect(kpis.minutes.changeUnit).toBe('phút');
    expect(kpis.accuracy.changeUnit).toBe('%');
  });

  it('change = thisWeek total - lastWeek total', () => {
    const today = daysAgo(0).toISOString();
    const sevenDaysAgo = daysAgo(7).toISOString();
    const { kpis } = computeWeeklyKpis([
      result({ submittedAt: today, totalQuestions: 50 }),
      result({ submittedAt: sevenDaysAgo, totalQuestions: 20 }),
    ]);
    expect(kpis.questions.change).toBe(30); // 50 - 20
  });

  it('accuracy KPI averages across results within the week', () => {
    const today = daysAgo(0).toISOString();
    const { kpis } = computeWeeklyKpis([
      result({ submittedAt: today, accuracy: 80 }),
      result({ submittedAt: today, accuracy: 60 }),
    ]);
    expect(kpis.accuracy.value).toBe(70);
  });

  it('sub text formats minutes/day human-readable', () => {
    const today = daysAgo(0).toISOString();
    const { kpis } = computeWeeklyKpis([
      result({ submittedAt: today, durationSec: 60 * 60 * 7 }), // 7h total → 1h/day
    ]);
    expect(kpis.minutes.sub).toMatch(/Trung bình ~1h/);
  });
});
