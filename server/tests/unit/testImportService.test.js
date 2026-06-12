import { describe, it, expect } from 'vitest';
import {
  resolveTestCode,
  testCodeToFolder,
  buildAudioUrl,
  buildPart1ImageUrl,
} from '../../src/services/testImportService.js';

describe('resolveTestCode', () => {
  it('uses testCode field when provided (uppercased)', () => {
    expect(resolveTestCode({ testCode: 't02', title: 'ignored' })).toBe('T02');
  });

  it('derives from "... Test 02" title', () => {
    expect(resolveTestCode({ title: 'ETS 2026 — Full Test 02' })).toBe('T02');
  });

  it('pads single digit (Test 1 → T01)', () => {
    expect(resolveTestCode({ title: 'ETS — Test 1' })).toBe('T01');
  });

  it('handles 2-digit (Test 10 → T10)', () => {
    expect(resolveTestCode({ title: 'ETS — Test 10' })).toBe('T10');
  });

  it('case-insensitive on "Test" keyword', () => {
    expect(resolveTestCode({ title: 'ETS — TEST 03' })).toBe('T03');
    expect(resolveTestCode({ title: 'ETS — test 04' })).toBe('T04');
  });

  it('throws ApiError 400 when title has no Test N pattern', () => {
    expect(() => resolveTestCode({ title: 'Random title' })).toThrowError(
      /testCode/,
    );
  });
});

describe('testCodeToFolder', () => {
  it('T02 → test-02', () => {
    expect(testCodeToFolder('T02')).toBe('test-02');
  });
  it('T10 → test-10', () => {
    expect(testCodeToFolder('T10')).toBe('test-10');
  });
  it('T1 → test-01 (single digit padded)', () => {
    expect(testCodeToFolder('T1')).toBe('test-01');
  });
});

describe('buildAudioUrl — Part 1/2 (single Q audio)', () => {
  it('Q1 → E26-T02-01.mp3', () => {
    expect(buildAudioUrl(1, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-01.mp3',
    );
  });
  it('Q6 (last Part 1) → E26-T02-06.mp3', () => {
    expect(buildAudioUrl(6, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-06.mp3',
    );
  });
  it('Q7 (first Part 2) → E26-T02-07.mp3', () => {
    expect(buildAudioUrl(7, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-07.mp3',
    );
  });
  it('Q31 (last Part 2) → E26-T02-31.mp3', () => {
    expect(buildAudioUrl(31, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-31.mp3',
    );
  });
});

describe('buildAudioUrl — Part 3 (3-question group)', () => {
  it('Q32-34 share same audio E26-T02-32-34.mp3', () => {
    const url = '/audio/ets-2026/test-02/E26-T02-32-34.mp3';
    expect(buildAudioUrl(32, 'T02', 'test-02')).toBe(url);
    expect(buildAudioUrl(33, 'T02', 'test-02')).toBe(url);
    expect(buildAudioUrl(34, 'T02', 'test-02')).toBe(url);
  });

  it('Q35-37 share same audio E26-T02-35-37.mp3', () => {
    const url = '/audio/ets-2026/test-02/E26-T02-35-37.mp3';
    expect(buildAudioUrl(35, 'T02', 'test-02')).toBe(url);
    expect(buildAudioUrl(37, 'T02', 'test-02')).toBe(url);
  });

  it('Q70 (last Part 3) → E26-T02-68-70.mp3', () => {
    expect(buildAudioUrl(70, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-68-70.mp3',
    );
  });
});

describe('buildAudioUrl — Part 4 (3-question group)', () => {
  it('Q71-73 share same audio E26-T02-71-73.mp3', () => {
    const url = '/audio/ets-2026/test-02/E26-T02-71-73.mp3';
    expect(buildAudioUrl(71, 'T02', 'test-02')).toBe(url);
    expect(buildAudioUrl(73, 'T02', 'test-02')).toBe(url);
  });

  it('Q100 (last Part 4) → E26-T02-98-100.mp3', () => {
    expect(buildAudioUrl(100, 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-98-100.mp3',
    );
  });
});

describe('buildAudioUrl — Reading parts have no audio', () => {
  [101, 130, 131, 146, 147, 200].forEach((q) => {
    it(`Q${q} returns empty string`, () => {
      expect(buildAudioUrl(q, 'T02', 'test-02')).toBe('');
    });
  });
});

describe('buildPart1ImageUrl', () => {
  it('Q1 → 01.PNG', () => {
    expect(buildPart1ImageUrl(1, 'test-02')).toBe(
      '/images/ets-2026/test-02/01.PNG',
    );
  });
  it('Q6 → 06.PNG', () => {
    expect(buildPart1ImageUrl(6, 'test-02')).toBe(
      '/images/ets-2026/test-02/06.PNG',
    );
  });
  it('returns empty for non-Part-1 questions (Q7+)', () => {
    expect(buildPart1ImageUrl(7, 'test-02')).toBe('');
    expect(buildPart1ImageUrl(100, 'test-02')).toBe('');
    expect(buildPart1ImageUrl(200, 'test-02')).toBe('');
  });
  it('returns empty for invalid Q (0)', () => {
    expect(buildPart1ImageUrl(0, 'test-02')).toBe('');
  });
});
