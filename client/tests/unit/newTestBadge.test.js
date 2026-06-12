import { describe, it, expect } from 'vitest';
import {
  buildDoneTestIdSet,
  isNewTest,
  NEW_TEST_WINDOW_DAYS,
} from '../../src/utils/newTestBadge.js';

describe('buildDoneTestIdSet', () => {
  it('empty array → empty set', () => {
    expect(buildDoneTestIdSet([]).size).toBe(0);
  });

  it('handles populated testId (object._id)', () => {
    const set = buildDoneTestIdSet([
      { testId: { _id: 't1' } },
      { testId: { _id: 't2' } },
    ]);
    expect(set.has('t1')).toBe(true);
    expect(set.has('t2')).toBe(true);
  });

  it('handles plain string testId', () => {
    const set = buildDoneTestIdSet([{ testId: 't3' }]);
    expect(set.has('t3')).toBe(true);
  });

  it('dedupes when same test appears multiple times', () => {
    const set = buildDoneTestIdSet([{ testId: 't1' }, { testId: 't1' }]);
    expect(set.size).toBe(1);
  });

  it('skips entries with no testId', () => {
    const set = buildDoneTestIdSet([{}, { testId: null }, { testId: 't1' }]);
    expect(set.size).toBe(1);
  });
});

describe('isNewTest', () => {
  const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
  const oldDate = new Date(
    Date.now() - (NEW_TEST_WINDOW_DAYS + 2) * 24 * 60 * 60 * 1000,
  ).toISOString();

  it('returns false when test has no createdAt', () => {
    expect(isNewTest({}, new Set())).toBe(false);
  });

  it('returns false when user has done the test', () => {
    expect(
      isNewTest({ _id: 't1', createdAt: recent }, new Set(['t1'])),
    ).toBe(false);
  });

  it('returns true for recent + not done', () => {
    expect(
      isNewTest({ _id: 't1', createdAt: recent }, new Set()),
    ).toBe(true);
  });

  it('returns false for old test (> window)', () => {
    expect(
      isNewTest({ _id: 't1', createdAt: oldDate }, new Set()),
    ).toBe(false);
  });

  it('exposes NEW_TEST_WINDOW_DAYS = 14', () => {
    expect(NEW_TEST_WINDOW_DAYS).toBe(14);
  });
});
