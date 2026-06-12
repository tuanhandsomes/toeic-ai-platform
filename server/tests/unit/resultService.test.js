import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all DB + AI deps BEFORE importing the service
vi.mock('../../src/models/Result.js', () => ({
  Result: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));
vi.mock('../../src/models/Test.js', () => ({
  Test: {
    findById: vi.fn(),
  },
}));
vi.mock('../../src/models/Question.js', () => ({
  Question: {
    find: vi.fn(),
  },
}));
vi.mock('../../src/services/aiAnalysisService.js', () => ({
  aiAnalysisService: {
    generateForResult: vi.fn().mockResolvedValue(null),
  },
}));

const { resultService } = await import('../../src/services/resultService.js');
const { Result } = await import('../../src/models/Result.js');
const { Test } = await import('../../src/models/Test.js');
const { Question } = await import('../../src/models/Question.js');
const { aiAnalysisService } = await import(
  '../../src/services/aiAnalysisService.js'
);

const mkTest = (overrides = {}) => ({
  _id: 't1',
  type: 'full',
  durationMinutes: 120,
  ...overrides,
});

const mkQ = (id, part, correctAnswer = 'A') => ({
  _id: id,
  part,
  correctAnswer,
});

beforeEach(() => {
  vi.clearAllMocks();
  // Result.create returns a doc with toObject()
  Result.create.mockImplementation(async (doc) => ({
    ...doc,
    _id: 'r1',
    toObject() {
      return { ...doc, _id: 'r1' };
    },
  }));
});

describe('resultService.submit — validation', () => {
  it('throws notFound when test does not exist', async () => {
    Test.findById.mockReturnValue({ lean: () => Promise.resolve(null) });
    await expect(
      resultService.submit({
        userId: 'u1',
        testId: 'gone',
        startedAt: new Date(),
        answers: [],
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws badRequest when answer references unknown question', async () => {
    Test.findById.mockReturnValue({ lean: () => Promise.resolve(mkTest()) });
    Question.find.mockReturnValue({
      select: () => ({ lean: () => Promise.resolve([]) }),
    });
    await expect(
      resultService.submit({
        userId: 'u1',
        testId: 't1',
        startedAt: new Date(),
        answers: [{ questionId: 'ghost', selected: 'A' }],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('resultService.submit — durationSec cap', () => {
  beforeEach(() => {
    Question.find.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve([mkQ('q1', 1, 'A'), mkQ('q2', 5, 'A')]),
      }),
    });
  });

  it('Full Test: caps durationSec at durationMinutes*60 + 300 buffer', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'full', durationMinutes: 120 })),
    });
    // startedAt 7 days ago — would be ~604800 seconds raw
    const startedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt,
      answers: [
        { questionId: 'q1', selected: 'A' },
        { questionId: 'q2', selected: 'B' },
      ],
    });

    const arg = Result.create.mock.calls[0][0];
    expect(arg.durationSec).toBe(120 * 60 + 300); // 7500
  });

  it('Full Test: keeps real duration when within cap', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'full', durationMinutes: 120 })),
    });
    const startedAt = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt,
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    const arg = Result.create.mock.calls[0][0];
    expect(arg.durationSec).toBeGreaterThanOrEqual(1798);
    expect(arg.durationSec).toBeLessThanOrEqual(1802);
  });

  it('Practice: caps at max(durationMinutes*60*4, 4h)', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'part', durationMinutes: 4 })),
    });
    // 4 phút × 4 = 960s = 16 min < 4h. Cap must be 4h = 14400s
    const startedAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt,
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    const arg = Result.create.mock.calls[0][0];
    expect(arg.durationSec).toBe(4 * 3600);
  });

  it('Practice long Part (33 min × 4 = 132 min): caps at durationMinutes*60*4 since > 4h', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'part', durationMinutes: 33 })),
    });
    const startedAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt,
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    const arg = Result.create.mock.calls[0][0];
    // 33*60*4 = 7920 < 14400 → cap is 14400 (4h)
    expect(arg.durationSec).toBe(4 * 3600);
  });

  it('durationSec is never negative when clock skew makes submittedAt < startedAt', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest()),
    });
    // startedAt in future → raw = negative → clamped to 0
    const startedAt = new Date(Date.now() + 60_000);
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt,
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    const arg = Result.create.mock.calls[0][0];
    expect(arg.durationSec).toBe(0);
  });
});

describe('resultService.submit — AI auto-trigger', () => {
  beforeEach(() => {
    Question.find.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve([mkQ('q1', 1, 'A'), mkQ('q2', 5, 'A')]),
      }),
    });
  });

  it('Full Test triggers AI analysis', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'full' })),
    });
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt: new Date(),
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    expect(aiAnalysisService.generateForResult).toHaveBeenCalledWith('r1');
  });

  it('Practice does NOT trigger AI analysis', async () => {
    Test.findById.mockReturnValue({
      lean: () => Promise.resolve(mkTest({ type: 'part', durationMinutes: 24 })),
    });
    await resultService.submit({
      userId: 'u1',
      testId: 't1',
      startedAt: new Date(),
      answers: [{ questionId: 'q1', selected: 'A' }],
    });
    expect(aiAnalysisService.generateForResult).not.toHaveBeenCalled();
  });
});
