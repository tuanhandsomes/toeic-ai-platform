import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/models/Result.js', () => ({
  Result: {
    find: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
  },
}));
vi.mock('../../src/models/Test.js', () => ({ Test: { findById: vi.fn() } }));
vi.mock('../../src/models/Question.js', () => ({
  Question: { find: vi.fn() },
}));
vi.mock('../../src/services/aiAnalysisService.js', () => ({
  aiAnalysisService: {
    generateForResult: vi.fn(),
    getByResultId: vi.fn().mockResolvedValue(null),
  },
}));

const { resultService } = await import('../../src/services/resultService.js');
const { Result } = await import('../../src/models/Result.js');
const { Question } = await import('../../src/models/Question.js');
const { aiAnalysisService } = await import(
  '../../src/services/aiAnalysisService.js'
);

const chainable = (resolved) => {
  const chain = {
    populate: vi.fn(() => chain),
    sort: vi.fn(() => chain),
    skip: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    lean: vi.fn(() => Promise.resolve(resolved)),
  };
  return chain;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resultService.listForUser', () => {
  it('returns items + pagination shape', async () => {
    Result.find.mockReturnValue(
      chainable([{ _id: 'r1' }, { _id: 'r2' }]),
    );
    Result.countDocuments.mockResolvedValue(42);

    const out = await resultService.listForUser('u1', { page: 2, limit: 20 });

    expect(out.items).toHaveLength(2);
    expect(out.pagination).toEqual({
      page: 2,
      limit: 20,
      total: 42,
      totalPages: 3,
    });
  });

  it('skips (page-1)*limit on the Mongoose chain', async () => {
    const chain = chainable([]);
    Result.find.mockReturnValue(chain);
    Result.countDocuments.mockResolvedValue(0);
    await resultService.listForUser('u1', { page: 3, limit: 10 });
    expect(chain.skip).toHaveBeenCalledWith(20);
    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it('defaults page=1, limit=20', async () => {
    const chain = chainable([]);
    Result.find.mockReturnValue(chain);
    Result.countDocuments.mockResolvedValue(0);
    await resultService.listForUser('u1');
    expect(chain.skip).toHaveBeenCalledWith(0);
    expect(chain.limit).toHaveBeenCalledWith(20);
  });

  it('filters by userId', async () => {
    Result.find.mockReturnValue(chainable([]));
    Result.countDocuments.mockResolvedValue(0);
    await resultService.listForUser('u1');
    expect(Result.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(Result.countDocuments).toHaveBeenCalledWith({ userId: 'u1' });
  });

  it('sorts by createdAt desc', async () => {
    const chain = chainable([]);
    Result.find.mockReturnValue(chain);
    Result.countDocuments.mockResolvedValue(0);
    await resultService.listForUser('u1');
    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('totalPages = ceil(total / limit)', async () => {
    Result.find.mockReturnValue(chainable([]));
    Result.countDocuments.mockResolvedValue(21);
    const out = await resultService.listForUser('u1', { page: 1, limit: 10 });
    expect(out.pagination.totalPages).toBe(3);
  });
});

describe('resultService.getByIdForUser', () => {
  const findByIdChain = (resolved) => {
    const c = {
      populate: vi.fn(() => c),
      lean: vi.fn(() => Promise.resolve(resolved)),
    };
    return c;
  };

  const questionsChain = (resolved) => ({
    lean: () => Promise.resolve(resolved),
  });

  it('throws notFound when result missing', async () => {
    Result.findById.mockReturnValue(findByIdChain(null));
    await expect(
      resultService.getByIdForUser('r1', 'u1'),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws forbidden when result belongs to another user', async () => {
    Result.findById.mockReturnValue(
      findByIdChain({ _id: 'r1', userId: 'u2', answers: [] }),
    );
    await expect(
      resultService.getByIdForUser('r1', 'u1'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('merges question docs into answers + attaches aiAnalysis', async () => {
    Result.findById.mockReturnValue(
      findByIdChain({
        _id: 'r1',
        userId: 'u1',
        answers: [
          { questionId: 'q1', selected: 'A' },
          { questionId: 'q2', selected: 'B' },
        ],
      }),
    );
    Question.find.mockReturnValue(
      questionsChain([
        { _id: 'q1', correctAnswer: 'A', content: { text: 'stem 1' } },
        { _id: 'q2', correctAnswer: 'C', content: { text: 'stem 2' } },
      ]),
    );
    aiAnalysisService.getByResultId.mockResolvedValue({ id: 'ai1' });

    const out = await resultService.getByIdForUser('r1', 'u1');

    expect(out.answers[0].question.correctAnswer).toBe('A');
    expect(out.answers[1].question.correctAnswer).toBe('C');
    expect(out.aiAnalysis).toEqual({ id: 'ai1' });
  });

  it('answers without matching question get question=null', async () => {
    Result.findById.mockReturnValue(
      findByIdChain({
        _id: 'r1',
        userId: 'u1',
        answers: [{ questionId: 'q-missing', selected: 'A' }],
      }),
    );
    Question.find.mockReturnValue(questionsChain([]));
    aiAnalysisService.getByResultId.mockResolvedValue(null);
    const out = await resultService.getByIdForUser('r1', 'u1');
    expect(out.answers[0].question).toBeNull();
  });
});
