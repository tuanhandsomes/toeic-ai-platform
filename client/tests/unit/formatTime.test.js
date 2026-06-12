import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDuration,
  formatDurationFull,
  formatDurationVi,
  formatDurationViFull,
} from '../../src/utils/formatTime.js';

describe('formatTime', () => {
  it('seconds < 60 → MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(45)).toBe('00:45');
    expect(formatTime(59)).toBe('00:59');
  });

  it('minutes 1-59 → MM:SS', () => {
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(125)).toBe('02:05');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('hours ≥ 1 → HH:MM:SS', () => {
    expect(formatTime(3600)).toBe('01:00:00');
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(7200)).toBe('02:00:00');
  });

  it('clamps negative to 00:00', () => {
    expect(formatTime(-100)).toBe('00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(65.9)).toBe('01:05');
  });
});

describe('formatDuration (short style, 2 units max)', () => {
  it('< 1 min → Ns', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45)).toBe('45s');
  });

  it('< 1 hour → Np Ms or Np', () => {
    expect(formatDuration(60)).toBe('1p');
    expect(formatDuration(125)).toBe('2p 5s');
    expect(formatDuration(3599)).toBe('59p 59s');
  });

  it('< 1 day → Nh Mp or Nh', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(7515)).toBe('2h 5p');
    expect(formatDuration(86399)).toBe('23h 59p');
  });

  it('≥ 1 day → Nd Mh or Nd', () => {
    expect(formatDuration(86400)).toBe('1d');
    expect(formatDuration(86400 + 3600)).toBe('1d 1h');
    expect(formatDuration(86400 * 3)).toBe('3d');
  });
});

describe('formatDurationFull (3 units max — d h p)', () => {
  it('< 1 hour → "Np"', () => {
    expect(formatDurationFull(0)).toBe('0p');
    expect(formatDurationFull(3599)).toBe('59p');
  });

  it('< 1 day → "Nh" or "Nh Mp"', () => {
    expect(formatDurationFull(3600)).toBe('1h');
    expect(formatDurationFull(7515)).toBe('2h 5p');
  });

  it('≥ 1 day can include all 3 (d h p)', () => {
    expect(formatDurationFull(86400 + 3600 * 20 + 60 * 45)).toBe('1d 20h 45p');
  });

  it('skips zero parts (1d 0h 5p → "1d 5p")', () => {
    expect(formatDurationFull(86400 + 60 * 5)).toBe('1d 5p');
  });

  it('1d alone when h=0 + p=0', () => {
    expect(formatDurationFull(86400)).toBe('1d');
  });
});

describe('formatDurationVi (Vietnamese, 2 units)', () => {
  it('< 1 min → "N giây"', () => {
    expect(formatDurationVi(45)).toBe('45 giây');
  });

  it('< 1 hour → "N phút M giây" or "N phút"', () => {
    expect(formatDurationVi(60)).toBe('1 phút');
    expect(formatDurationVi(125)).toBe('2 phút 5 giây');
  });

  it('< 1 day → "N giờ M phút"', () => {
    expect(formatDurationVi(3600)).toBe('1 giờ');
    expect(formatDurationVi(7515)).toBe('2 giờ 5 phút');
  });

  it('≥ 1 day → "N ngày M giờ"', () => {
    expect(formatDurationVi(86400)).toBe('1 ngày');
    expect(formatDurationVi(86400 + 3600 * 5)).toBe('1 ngày 5 giờ');
  });
});

describe('formatDurationViFull (Vietnamese 3 units)', () => {
  it('all 3 units when present', () => {
    expect(formatDurationViFull(86400 + 3600 * 20 + 60 * 58)).toBe(
      '3 ngày 20 giờ 58 phút'.replace(/^3/, '1'), // 1 day
    );
  });

  it('skips 0 hours when minutes present', () => {
    expect(formatDurationViFull(86400 + 60 * 30)).toBe('1 ngày 30 phút');
  });

  it('< 1 hour shows just phút', () => {
    expect(formatDurationViFull(60 * 30)).toBe('30 phút');
  });
});
