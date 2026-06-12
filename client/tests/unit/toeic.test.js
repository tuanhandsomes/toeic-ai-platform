import { describe, it, expect } from 'vitest';
import {
  PART_OFFSETS,
  computeGlobalNumbers,
  parsePassageRange,
  parseAudioRange,
  getDisplayDuration,
  buildPassagePrompt,
} from '../../src/constants/toeic.js';

describe('PART_OFFSETS', () => {
  it('matches TOEIC structure (Part 1 starts at 1, Part 7 at 147)', () => {
    expect(PART_OFFSETS).toEqual({
      1: 1,
      2: 7,
      3: 32,
      4: 71,
      5: 101,
      6: 131,
      7: 147,
    });
  });
});

describe('computeGlobalNumbers', () => {
  it('Practice Part 1 → 1, 2, ..., 6', () => {
    const qs = Array.from({ length: 6 }, () => ({ part: 1 }));
    expect(computeGlobalNumbers(qs)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('Practice Part 7 → 147, 148, ..., 200', () => {
    const qs = Array.from({ length: 54 }, () => ({ part: 7 }));
    const out = computeGlobalNumbers(qs);
    expect(out[0]).toBe(147);
    expect(out[53]).toBe(200);
  });

  it('Full Test sequential 1-200 across all parts', () => {
    const qs = [
      ...Array.from({ length: 6 }, () => ({ part: 1 })),
      ...Array.from({ length: 25 }, () => ({ part: 2 })),
      ...Array.from({ length: 39 }, () => ({ part: 3 })),
      ...Array.from({ length: 30 }, () => ({ part: 4 })),
      ...Array.from({ length: 30 }, () => ({ part: 5 })),
      ...Array.from({ length: 16 }, () => ({ part: 6 })),
      ...Array.from({ length: 54 }, () => ({ part: 7 })),
    ];
    const out = computeGlobalNumbers(qs);
    expect(out[0]).toBe(1);
    expect(out[5]).toBe(6); // last Part 1
    expect(out[6]).toBe(7); // first Part 2
    expect(out[30]).toBe(31); // last Part 2
    expect(out[31]).toBe(32); // first Part 3
    expect(out[199]).toBe(200); // last Q
  });
});

describe('parsePassageRange', () => {
  it('passage-q147-148.PNG → { type, start, end }', () => {
    expect(parsePassageRange('/img/passage-q147-148.PNG')).toEqual({
      type: 'passage',
      start: 147,
      end: 148,
    });
  });

  it('graphic-q62-64.PNG → graphic type', () => {
    expect(parsePassageRange('/img/graphic-q62-64.PNG')).toEqual({
      type: 'graphic',
      start: 62,
      end: 64,
    });
  });

  it('multi-passage semicolon list uses first segment', () => {
    expect(
      parsePassageRange(
        '/img/passage-q176-180-a.PNG;/img/passage-q176-180-b.PNG',
      ),
    ).toEqual({
      type: 'passage',
      start: 176,
      end: 180,
    });
  });

  it('null when URL is empty or unmatched', () => {
    expect(parsePassageRange('')).toBeNull();
    expect(parsePassageRange(null)).toBeNull();
    expect(parsePassageRange('/img/random.PNG')).toBeNull();
  });
});

describe('parseAudioRange', () => {
  it('group audio E26-T01-32-34.mp3 → { start, end }', () => {
    expect(parseAudioRange('/audio/E26-T01-32-34.mp3')).toEqual({
      start: 32,
      end: 34,
    });
  });

  it('single audio E26-T01-07.mp3 → null (not a group)', () => {
    expect(parseAudioRange('/audio/E26-T01-07.mp3')).toBeNull();
  });

  it('null when URL is empty', () => {
    expect(parseAudioRange('')).toBeNull();
    expect(parseAudioRange(null)).toBeNull();
  });
});

describe('getDisplayDuration', () => {
  it('returns test.durationMinutes', () => {
    expect(getDisplayDuration({ durationMinutes: 33 })).toBe(33);
  });
  it('returns 0 when missing', () => {
    expect(getDisplayDuration(null)).toBe(0);
    expect(getDisplayDuration({})).toBe(0);
  });
});

describe('buildPassagePrompt', () => {
  it('null range → null', () => {
    expect(buildPassagePrompt(null)).toBeNull();
  });

  it('single-Q range → "Câu N dựa vào..."', () => {
    expect(
      buildPassagePrompt({ type: 'passage', start: 147, end: 147 }),
    ).toBe('Câu 147 dựa vào đoạn văn sau:');
  });

  it('multi-Q passage range', () => {
    expect(
      buildPassagePrompt({ type: 'passage', start: 147, end: 148 }),
    ).toBe('Câu 147–148 dựa vào đoạn văn sau:');
  });

  it('graphic type uses "hình ảnh" wording', () => {
    expect(
      buildPassagePrompt({ type: 'graphic', start: 62, end: 64 }),
    ).toBe('Câu 62–64 dựa vào hình ảnh sau:');
  });
});
