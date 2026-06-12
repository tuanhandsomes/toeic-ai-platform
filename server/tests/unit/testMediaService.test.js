import { describe, it, expect } from 'vitest';
import {
  deriveTestCode,
  testCodeToFolder,
  buildLocalUrl,
} from '../../src/services/testMediaService.js';

describe('deriveTestCode', () => {
  it('parses single-digit test num + pads', () => {
    expect(deriveTestCode({ title: 'ETS — Test 3' })).toBe('T03');
  });
  it('parses 2-digit test num', () => {
    expect(deriveTestCode({ title: 'ETS — Test 10' })).toBe('T10');
  });
  it('case-insensitive on Test keyword', () => {
    expect(deriveTestCode({ title: 'something TEST 5' })).toBe('T05');
  });
  it('throws ApiError 400 for unparseable title', () => {
    expect(() => deriveTestCode({ title: 'no number here' })).toThrowError(
      /mã đề/,
    );
  });
});

describe('testCodeToFolder', () => {
  it('T02 → test-02', () => {
    expect(testCodeToFolder('T02')).toBe('test-02');
  });
});

describe('buildLocalUrl — audio MP3', () => {
  it('single-Q name → /audio/ets-2026/test-02/<name>.mp3', () => {
    expect(buildLocalUrl('E26-T02-01.mp3', 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-01.mp3',
    );
  });

  it('group-Q name (Part 3/4)', () => {
    expect(buildLocalUrl('E26-T02-32-34.mp3', 'T02', 'test-02')).toBe(
      '/audio/ets-2026/test-02/E26-T02-32-34.mp3',
    );
  });

  it('rejects name with wrong test code', () => {
    expect(() =>
      buildLocalUrl('E26-T05-01.mp3', 'T02', 'test-02'),
    ).toThrowError(/đề khác/);
  });

  it('rejects malformed audio name', () => {
    expect(() =>
      buildLocalUrl('whatever.mp3', 'T02', 'test-02'),
    ).toThrowError(/Tên file âm thanh/);
  });
});

describe('buildLocalUrl — Part 1 image (NN.PNG/JPG)', () => {
  it('01.PNG valid', () => {
    expect(buildLocalUrl('01.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/01.PNG',
    );
  });
  it('06.PNG valid (last Part 1)', () => {
    expect(buildLocalUrl('06.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/06.PNG',
    );
  });
  it('10.PNG valid edge', () => {
    expect(buildLocalUrl('10.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/10.PNG',
    );
  });
  it('jpg extension valid', () => {
    expect(buildLocalUrl('03.jpg', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/03.jpg',
    );
  });
  it('rejects 00.PNG (zero not allowed)', () => {
    expect(() => buildLocalUrl('00.PNG', 'T02', 'test-02')).toThrowError(
      /hình ảnh/,
    );
  });
});

describe('buildLocalUrl — passage/graphic images', () => {
  it('graphic-q62-64.PNG valid (Part 3/4 graphic)', () => {
    expect(buildLocalUrl('graphic-q62-64.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/graphic-q62-64.PNG',
    );
  });

  it('passage-q131-134.PNG valid (Part 6/7 single)', () => {
    expect(buildLocalUrl('passage-q131-134.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/passage-q131-134.PNG',
    );
  });

  it('passage-q176-180-a.PNG valid (Part 7 multi)', () => {
    expect(buildLocalUrl('passage-q176-180-a.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/passage-q176-180-a.PNG',
    );
  });

  it('passage-q176-180-c.PNG valid (triple passage 3rd)', () => {
    expect(buildLocalUrl('passage-q176-180-c.PNG', 'T02', 'test-02')).toBe(
      '/images/ets-2026/test-02/passage-q176-180-c.PNG',
    );
  });

  it('rejects passage-q176-180-d.PNG (only a/b/c allowed)', () => {
    expect(() =>
      buildLocalUrl('passage-q176-180-d.PNG', 'T02', 'test-02'),
    ).toThrowError(/hình ảnh/);
  });

  it('rejects random.png', () => {
    expect(() => buildLocalUrl('random.png', 'T02', 'test-02')).toThrowError(
      /hình ảnh/,
    );
  });
});

describe('buildLocalUrl — unsupported extension', () => {
  it('rejects .wav (audio outside MP3)', () => {
    expect(() => buildLocalUrl('foo.wav', 'T02', 'test-02')).toThrowError(
      /không hỗ trợ/,
    );
  });
  it('rejects .webp (image outside PNG/JPG)', () => {
    expect(() => buildLocalUrl('01.webp', 'T02', 'test-02')).toThrowError(
      /không hỗ trợ/,
    );
  });
});
