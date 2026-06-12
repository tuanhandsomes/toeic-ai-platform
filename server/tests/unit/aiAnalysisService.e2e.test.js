import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock model + OpenAI client BEFORE importing service
vi.mock('../../src/models/AIAnalysis.js', () => ({
  AIAnalysis: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteOne: vi.fn(),
  },
}));
vi.mock('../../src/models/Result.js', () => ({
  Result: { findById: vi.fn() },
}));
vi.mock('../../src/models/User.js', () => ({
  User: { findById: vi.fn() },
}));
vi.mock('../../src/models/Question.js', () => ({
  Question: { find: vi.fn() },
}));
vi.mock('../../src/models/Test.js', () => ({
  Test: { findById: vi.fn(), find: vi.fn() },
}));
vi.mock('../../src/config/openai.js', () => ({
  getOpenAIClient: vi.fn(),
}));

const { aiAnalysisService } = await import(
  '../../src/services/aiAnalysisService.js'
);
const { AIAnalysis } = await import('../../src/models/AIAnalysis.js');
const { Result } = await import('../../src/models/Result.js');
const { User } = await import('../../src/models/User.js');
const { Question } = await import('../../src/models/Question.js');
const { Test } = await import('../../src/models/Test.js');
const { getOpenAIClient } = await import('../../src/config/openai.js');

// 200 đáp án (đều selected non-null) để vượt threshold detectEmptyAttempt.
// 150 correct (75%) — Full Test typical.
const fakeAnswers = () =>
  Array.from({ length: 200 }, (_, i) => ({
    questionId: `q${i + 1}`,
    selected: i % 4 === 0 ? 'A' : 'B',
    isCorrect: i < 150,
    timeSpentSec: 10 + (i % 5),
  }));

const fakeResult = (overrides = {}) => ({
  _id: 'r1',
  userId: 'u1',
  testId: 't1',
  testType: 'full',
  totalQuestions: 200,
  correctCount: 150,
  accuracy: 75,
  scoreTotal: 700,
  durationSec: 7000,
  partBreakdown: {
    part1: { correct: 5, total: 6 },
    part5: { correct: 25, total: 30 },
  },
  answers: fakeAnswers(),
  ...overrides,
});

const fakeQuestion = (id, part) => ({
  _id: id,
  part,
  tags: [],
  difficulty: 'medium',
  correctAnswer: 'A',
  content: { text: 'stem text' },
  options: [
    { key: 'A', text: 'A text' },
    { key: 'B', text: 'B text' },
    { key: 'C', text: 'C text' },
    { key: 'D', text: 'D text' },
  ],
});

const chainLean = (resolved) => ({ lean: () => Promise.resolve(resolved) });
const chainSelectLean = (resolved) => ({
  select: () => chainLean(resolved),
});

const docFromCreate = (doc) => ({
  ...doc,
  toObject: () => doc,
});

beforeEach(() => {
  vi.clearAllMocks();
  AIAnalysis.create.mockImplementation((doc) =>
    Promise.resolve(docFromCreate(doc)),
  );
  // Default Test.find for attachSuggestedTests — return empty so no suggestion
  Test.find.mockReturnValue({
    select: () => ({
      sort: () => ({ lean: () => Promise.resolve([]) }),
    }),
  });
  Test.findById.mockReturnValue(chainSelectLean({ series: 'ETS 2026' }));
});

describe('generateForResult — result missing', () => {
  it('returns null when result not found', async () => {
    Result.findById.mockReturnValue(chainLean(null));
    const out = await aiAnalysisService.generateForResult('r-missing');
    expect(out).toBeNull();
    expect(AIAnalysis.create).not.toHaveBeenCalled();
  });
});

describe('generateForResult — cache hit', () => {
  it('returns existing analysis without calling OpenAI', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean({ _id: 'ai1', cached: true }));
    const out = await aiAnalysisService.generateForResult('r1');
    expect(out).toEqual({ _id: 'ai1', cached: true });
    expect(getOpenAIClient).not.toHaveBeenCalled();
    expect(AIAnalysis.create).not.toHaveBeenCalled();
  });
});

describe('generateForResult — empty attempt short-circuit', () => {
  it('does NOT call OpenAI for blank submission', async () => {
    const emptyResult = fakeResult({
      totalQuestions: 200,
      correctCount: 0,
      accuracy: 0,
      answers: Array.from({ length: 200 }, (_, i) => ({
        questionId: `q${i}`,
        selected: null,
        isCorrect: false,
        timeSpentSec: 0,
      })),
    });
    Result.findById.mockReturnValue(chainLean(emptyResult));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));

    const out = await aiAnalysisService.generateForResult('r1');

    expect(getOpenAIClient).not.toHaveBeenCalled();
    expect(out.model).toBe('empty-attempt-v1');
    expect(out.isFallback).toBe(true);
    expect(out.strengths).toEqual([]);
    expect(out.weaknesses).toHaveLength(1);
    expect(out.weaknesses[0]).toMatch(/200\/200/);
    expect(out.recommendations).toHaveLength(1);
    expect(out.recommendations[0].priority).toBe('high');
    expect(out.estimatedTargetWeeks).toBe(0);
  });
});

describe('generateForResult — OpenAI fail → heuristic fallback', () => {
  it('falls back to heuristic when OpenAI client unavailable', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(
      chainSelectLean({ targetScore: 800, fullName: 'A' }),
    );
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    getOpenAIClient.mockReturnValue(null);

    const out = await aiAnalysisService.generateForResult('r1');

    expect(out.model).toBe('heuristic-v1');
    expect(out.isFallback).toBe(true);
    expect(out.strengths.length).toBeGreaterThan(0);
    expect(Array.isArray(out.recommendations)).toBe(true);
  });

  it('falls back when OpenAI throws', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(
      chainSelectLean({ targetScore: 800 }),
    );
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    getOpenAIClient.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue(new Error('OpenAI down')),
        },
      },
    });

    const out = await aiAnalysisService.generateForResult('r1');
    expect(out.isFallback).toBe(true);
    expect(out.model).toBe('heuristic-v1');
  });
});

describe('generateForResult — OpenAI success path', () => {
  const openAiPayload = {
    strengths: ['Part 1 — đúng 5/6 câu'],
    weaknesses: ['Dạng word-form — sai 5 câu'],
    recommendations: [
      {
        topic: 'Part 5 — word-form',
        action: 'Drill 30 câu word-form trong 3 ngày...',
        priority: 'high',
        targetPart: 5,
      },
    ],
    estimatedTargetWeeks: 12,
  };

  it('saves AI payload + tokensUsed when OpenAI returns valid JSON', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(
      chainSelectLean({ targetScore: 800 }),
    );
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    getOpenAIClient.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: { content: JSON.stringify(openAiPayload) },
                finish_reason: 'stop',
              },
            ],
            usage: { total_tokens: 1234 },
          }),
        },
      },
    });

    const out = await aiAnalysisService.generateForResult('r1');

    expect(out.isFallback).toBe(false);
    expect(out.tokensUsed).toBe(1234);
    expect(out.strengths).toEqual(openAiPayload.strengths);
    expect(out.recommendations[0].topic).toBe('Part 5 — word-form');
  });

  it('attaches suggested Practice test when targetPart matches a candidate', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(chainSelectLean({ targetScore: 800 }));
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    Test.find.mockReturnValue({
      select: () => ({
        sort: () => ({
          lean: () =>
            Promise.resolve([
              {
                _id: 'practice-part5',
                title: 'Practice Part 5',
                part: 5,
                series: 'ETS 2026',
                createdAt: new Date(),
              },
            ]),
        }),
      }),
    });
    getOpenAIClient.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: { content: JSON.stringify(openAiPayload) },
                finish_reason: 'stop',
              },
            ],
            usage: { total_tokens: 100 },
          }),
        },
      },
    });

    const out = await aiAnalysisService.generateForResult('r1');
    expect(out.recommendations[0].suggestedTestId).toBe('practice-part5');
    expect(out.recommendations[0].suggestedTestTitle).toBe('Practice Part 5');
  });

  it('falls back to heuristic on finish_reason=length (truncated)', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(chainSelectLean({ targetScore: 800 }));
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    getOpenAIClient.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: { content: '{"partial":' },
                finish_reason: 'length',
              },
            ],
            usage: { total_tokens: 500 },
          }),
        },
      },
    });

    const out = await aiAnalysisService.generateForResult('r1');
    expect(out.isFallback).toBe(true);
    expect(out.model).toBe('heuristic-v1');
  });
});

describe('regenerateForResult', () => {
  it('deletes existing analysis then regenerates', async () => {
    Result.findById.mockReturnValue(chainLean(fakeResult()));
    AIAnalysis.findOne.mockReturnValue(chainLean(null));
    User.findById.mockReturnValue(chainSelectLean({ targetScore: 800 }));
    Question.find.mockReturnValue(
      chainSelectLean([fakeQuestion('q1', 1), fakeQuestion('q2', 5)]),
    );
    getOpenAIClient.mockReturnValue(null); // heuristic

    await aiAnalysisService.regenerateForResult('r1');
    expect(AIAnalysis.deleteOne).toHaveBeenCalledWith({ resultId: 'r1' });
    expect(AIAnalysis.create).toHaveBeenCalledOnce();
  });
});

describe('getByResultId', () => {
  it('looks up by resultId via findOne().lean()', async () => {
    AIAnalysis.findOne.mockReturnValue(chainLean({ _id: 'ai1' }));
    const out = await aiAnalysisService.getByResultId('r1');
    expect(out).toEqual({ _id: 'ai1' });
    expect(AIAnalysis.findOne).toHaveBeenCalledWith({ resultId: 'r1' });
  });
});
