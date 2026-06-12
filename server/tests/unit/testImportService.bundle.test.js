import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/models/Question.js', () => ({
  Question: { insertMany: vi.fn() },
}));
vi.mock('../../src/models/Test.js', () => ({
  Test: { findOne: vi.fn(), create: vi.fn() },
}));

const { testImportService } = await import(
  '../../src/services/testImportService.js'
);
const { Question } = await import('../../src/models/Question.js');
const { Test } = await import('../../src/models/Test.js');

const validBundle = (overrides = {}) => ({
  testInfo: {
    title: 'ETS 2026 — Full Test 03',
    series: 'ETS 2026',
    year: 2026,
    difficulty: 'medium',
    ...overrides.testInfo,
  },
  questions:
    overrides.questions ||
    Array.from({ length: 200 }, (_, i) => ({
      questionNumber: i + 1,
      part:
        i < 6 ? 1 : i < 31 ? 2 : i < 70 ? 3 : i < 100 ? 4 : i < 130 ? 5 : i < 146 ? 6 : 7,
      options: [
        { key: 'A', text: 'A' },
        { key: 'B', text: 'B' },
        { key: 'C', text: 'C' },
        { key: 'D', text: 'D' },
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
    })),
});

beforeEach(() => {
  vi.clearAllMocks();
  Test.findOne.mockResolvedValue(null); // no duplicate
  // Question.insertMany returns the input as inserted docs with _id
  Question.insertMany.mockImplementation(async (docs) =>
    docs.map((d, idx) => ({ ...d, _id: `q-${idx + 1}` })),
  );
  // Test.create returns doc with toObject()
  Test.create.mockImplementation(async (doc) => ({
    ...doc,
    _id: `t-${doc.type}-${doc.part || 'full'}`,
    toObject() {
      return doc;
    },
  }));
});

describe('importBundle — input validation', () => {
  it('throws when testInfo.title is missing', async () => {
    await expect(
      testImportService.importBundle({ testInfo: {}, questions: [{}] }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws when questions is empty array', async () => {
    await expect(
      testImportService.importBundle({
        testInfo: { title: 'ETS — Test 03' },
        questions: [],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws when questions is missing/not array', async () => {
    await expect(
      testImportService.importBundle({
        testInfo: { title: 'ETS — Test 03' },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('throws conflict when test with same title exists', async () => {
    Test.findOne.mockResolvedValue({ _id: 'existing' });
    await expect(
      testImportService.importBundle(validBundle()),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws when title cannot resolve testCode', async () => {
    await expect(
      testImportService.importBundle({
        testInfo: { title: 'Random Title' },
        questions: [{ questionNumber: 1, part: 1, options: [], correctAnswer: 'A' }],
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('importBundle — question docs', () => {
  it('inserts all 200 questions in one insertMany', async () => {
    await testImportService.importBundle(validBundle());
    expect(Question.insertMany).toHaveBeenCalledOnce();
    expect(Question.insertMany.mock.calls[0][0]).toHaveLength(200);
  });

  it('auto-fills audioUrl for Part 1 Q1 → E26-T03-01.mp3', async () => {
    await testImportService.importBundle(validBundle());
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[0].content.audioUrl).toBe(
      '/audio/ets-2026/test-03/E26-T03-01.mp3',
    );
  });

  it('auto-fills audioUrl for Part 3 Q32 → grouped E26-T03-32-34.mp3', async () => {
    await testImportService.importBundle(validBundle());
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[31].content.audioUrl).toBe(
      '/audio/ets-2026/test-03/E26-T03-32-34.mp3',
    );
  });

  it('auto-fills imageUrl for Part 1 Q1 → 01.PNG', async () => {
    await testImportService.importBundle(validBundle());
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[0].content.imageUrl).toBe(
      '/images/ets-2026/test-03/01.PNG',
    );
  });

  it('Reading parts get empty audioUrl', async () => {
    await testImportService.importBundle(validBundle());
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[100].content.audioUrl).toBe(''); // Part 5 Q101
    expect(docs[199].content.audioUrl).toBe(''); // Part 7 Q200
  });

  it('respects explicit audioUrl/imageUrl overrides in JSON', async () => {
    const bundle = validBundle({
      questions: Array.from({ length: 1 }, () => ({
        questionNumber: 1,
        part: 1,
        audioUrl: 'https://custom.com/audio.mp3',
        imageUrl: 'https://custom.com/image.png',
        options: [
          { key: 'A', text: 'A' },
          { key: 'B', text: 'B' },
          { key: 'C', text: 'C' },
          { key: 'D', text: 'D' },
        ],
        correctAnswer: 'A',
      })),
    });
    await testImportService.importBundle(bundle);
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[0].content.audioUrl).toBe('https://custom.com/audio.mp3');
    expect(docs[0].content.imageUrl).toBe('https://custom.com/image.png');
  });

  it('adds part + series tags to each question', async () => {
    await testImportService.importBundle(validBundle());
    const docs = Question.insertMany.mock.calls[0][0];
    expect(docs[0].tags).toEqual(expect.arrayContaining(['part1', 'ets-2026']));
    expect(docs[100].tags).toEqual(expect.arrayContaining(['part5']));
  });
});

describe('importBundle — Test docs', () => {
  it('creates 1 Full Test + 7 Practice (one per Part)', async () => {
    await testImportService.importBundle(validBundle());
    expect(Test.create).toHaveBeenCalledTimes(8); // 1 full + 7 practice
    const types = Test.create.mock.calls.map((c) => c[0].type);
    expect(types.filter((t) => t === 'full')).toHaveLength(1);
    expect(types.filter((t) => t === 'part')).toHaveLength(7);
  });

  it('Full Test has 200 questionIds + durationMinutes=120', async () => {
    await testImportService.importBundle(validBundle());
    const fullArg = Test.create.mock.calls.find((c) => c[0].type === 'full')[0];
    expect(fullArg.questionIds).toHaveLength(200);
    expect(fullArg.durationMinutes).toBe(120);
    expect(fullArg.totalQuestions).toBe(200);
    expect(fullArg.part).toBeNull();
  });

  it('Practice durations match calibration (Part 1=4, 2=15, 3=24, 4=18, 5=18, 6=10, 7=33)', async () => {
    await testImportService.importBundle(validBundle());
    const expected = { 1: 4, 2: 15, 3: 24, 4: 18, 5: 18, 6: 10, 7: 33 };
    const practices = Test.create.mock.calls.filter((c) => c[0].type === 'part');
    practices.forEach((c) => {
      const arg = c[0];
      expect(arg.durationMinutes).toBe(expected[arg.part]);
    });
  });

  it('Practice sets share questionIds with Full Test (per Part)', async () => {
    await testImportService.importBundle(validBundle());
    const part1 = Test.create.mock.calls.find(
      (c) => c[0].type === 'part' && c[0].part === 1,
    )[0];
    expect(part1.questionIds).toHaveLength(6);
    const part7 = Test.create.mock.calls.find(
      (c) => c[0].type === 'part' && c[0].part === 7,
    )[0];
    expect(part7.questionIds).toHaveLength(54);
  });

  it('skips Practice creation for parts with 0 questions', async () => {
    // Only 6 Part 1 questions, no others
    const bundle = validBundle({
      questions: Array.from({ length: 6 }, (_, i) => ({
        questionNumber: i + 1,
        part: 1,
        options: [
          { key: 'A', text: 'A' },
          { key: 'B', text: 'B' },
          { key: 'C', text: 'C' },
          { key: 'D', text: 'D' },
        ],
        correctAnswer: 'A',
      })),
    });
    await testImportService.importBundle(bundle);
    const practices = Test.create.mock.calls.filter((c) => c[0].type === 'part');
    expect(practices).toHaveLength(1); // only Part 1
  });
});

describe('importBundle — return value', () => {
  it('returns test + practiceSets + questionCount', async () => {
    const out = await testImportService.importBundle(validBundle());
    expect(out).toHaveProperty('test');
    expect(out).toHaveProperty('practiceSets');
    expect(out).toHaveProperty('questionCount');
    expect(out.questionCount).toBe(200);
    expect(out.practiceSets).toHaveLength(7);
  });
});
