import { describe, it, expect } from 'vitest';
import {
  buildErrorPatterns,
  detectEmptyAttempt,
  buildEmptyAttemptAnalysis,
} from '../../src/services/aiAnalysisService.js';

// Helpers
const q = (part, id, opts = {}) => ({
  _id: id,
  part,
  tags: opts.tags || [],
  difficulty: opts.difficulty || 'medium',
  correctAnswer: opts.correctAnswer || 'A',
  content: { text: opts.text || '' },
  options: opts.options || [
    { key: 'A', text: 'Option A text' },
    { key: 'B', text: 'Option B text' },
    { key: 'C', text: 'Option C text' },
    { key: 'D', text: 'Option D text' },
  ],
});

const a = (id, selected, isCorrect, timeSpentSec = 10) => ({
  questionId: id,
  selected,
  isCorrect,
  timeSpentSec,
});

describe('buildErrorPatterns — globalNum computation', () => {
  it('Practice Part 5 → globalNum bắt đầu từ 101', () => {
    const questions = [q(5, 'q1'), q(5, 'q2'), q(5, 'q3')];
    const answers = [
      a('q1', 'A', false),
      a('q2', 'B', false),
      a('q3', 'A', true),
    ];
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    const nums = wrongQuestionDetails.map((d) => d.globalNum).sort();
    expect(nums).toEqual([101, 102]);
  });

  it('Practice Part 7 → globalNum bắt đầu từ 147', () => {
    const questions = [q(7, 'q1'), q(7, 'q2')];
    const answers = [a('q1', 'B', false), a('q2', 'A', true)];
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    expect(wrongQuestionDetails[0].globalNum).toBe(147);
  });

  it('Full Test → globalNum đúng cho mỗi Part theo offsets', () => {
    // 1 wrong from each Part — assert globalNum aligns with PART_OFFSETS
    const questions = [
      q(1, 'q1'),
      q(2, 'q2'),
      q(3, 'q3'),
      q(5, 'q5'),
      q(7, 'q7'),
    ];
    const answers = [
      a('q1', 'B', false),
      a('q2', 'B', false),
      a('q3', 'B', false),
      a('q5', 'B', false),
      a('q7', 'B', false),
    ];
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    const byPart = Object.fromEntries(
      wrongQuestionDetails.map((d) => [d.part, d.globalNum]),
    );
    expect(byPart[1]).toBe(1);
    expect(byPart[2]).toBe(7);
    expect(byPart[3]).toBe(32);
    expect(byPart[5]).toBe(101);
    expect(byPart[7]).toBe(147);
  });
});

describe('buildErrorPatterns — wrongQuestionDetails fields', () => {
  it('includes selected / correct + option texts', () => {
    const questions = [
      q(5, 'q1', {
        correctAnswer: 'D',
        options: [
          { key: 'A', text: 'success' },
          { key: 'B', text: 'successful' },
          { key: 'C', text: 'successfully' },
          { key: 'D', text: 'succeed' },
        ],
      }),
    ];
    const answers = [a('q1', 'B', false, 30)];
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    expect(wrongQuestionDetails[0]).toMatchObject({
      selected: 'B',
      correct: 'D',
      selectedText: 'successful',
      correctText: 'succeed',
      timeSpentSec: 30,
    });
  });

  it('marks isSlow=true when time >= 1.5x average', () => {
    const questions = [q(5, 'q1'), q(5, 'q2'), q(5, 'q3')];
    const answers = [
      a('q1', 'B', false, 10),
      a('q2', 'B', false, 10),
      a('q3', 'B', false, 30), // 3x average → slow
    ];
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    const slow = wrongQuestionDetails.find((d) => d.timeSpentSec === 30);
    expect(slow.isSlow).toBe(true);
    const fast = wrongQuestionDetails.find((d) => d.timeSpentSec === 10);
    expect(fast.isSlow).toBe(false);
  });

  it('caps at MAX_WRONG_DETAILS=25 and sorts by hard+slow priority', () => {
    const questions = [];
    const answers = [];
    // 30 easy wrong + 10 hard wrong → expect 25 returned, hard ones included
    for (let i = 0; i < 30; i++) {
      const id = `easy-${i}`;
      questions.push(q(5, id, { difficulty: 'easy' }));
      answers.push(a(id, 'B', false));
    }
    for (let i = 0; i < 10; i++) {
      const id = `hard-${i}`;
      questions.push(q(5, id, { difficulty: 'hard' }));
      answers.push(a(id, 'B', false));
    }
    const { wrongQuestionDetails } = buildErrorPatterns(answers, questions);
    expect(wrongQuestionDetails.length).toBe(25);
    // First items should be hard (higher weight)
    expect(wrongQuestionDetails[0].difficulty).toBe('hard');
    const hardCount = wrongQuestionDetails.filter((d) => d.difficulty === 'hard').length;
    expect(hardCount).toBe(10);
  });
});

describe('buildErrorPatterns — errorBreakdown aggregates', () => {
  it('counts wrong/total per Part + difficulty buckets', () => {
    const questions = [
      q(5, 'q1', { difficulty: 'easy' }),
      q(5, 'q2', { difficulty: 'medium' }),
      q(5, 'q3', { difficulty: 'hard' }),
      q(5, 'q4', { difficulty: 'hard' }),
    ];
    const answers = [
      a('q1', 'A', true),
      a('q2', 'B', false),
      a('q3', 'B', false),
      a('q4', 'B', false),
    ];
    const { errorBreakdown } = buildErrorPatterns(answers, questions);
    expect(errorBreakdown[5].wrongCount).toBe(3);
    expect(errorBreakdown[5].totalCount).toBe(4);
    expect(errorBreakdown[5].difficultyCounts).toEqual({
      easy: 0,
      medium: 1,
      hard: 2,
    });
  });

  it('strips redundant tags (part5, test-04, ets) from tagCounts', () => {
    const questions = [
      q(5, 'q1', { tags: ['word-form', 'part5', 'ets', 'test-04'] }),
    ];
    const answers = [a('q1', 'B', false)];
    const { errorBreakdown } = buildErrorPatterns(answers, questions);
    expect(errorBreakdown[5].tagCounts).toEqual({ 'word-form': 1 });
  });
});

describe('buildErrorPatterns — strongPatterns', () => {
  it('counts correct-answer tags per Part with min 2 threshold', () => {
    const questions = [
      q(5, 'q1', { tags: ['word-form'] }),
      q(5, 'q2', { tags: ['word-form'] }),
      q(5, 'q3', { tags: ['preposition'] }), // only 1 — filtered out
      q(5, 'q4', { tags: ['word-form'] }),
    ];
    const answers = [
      a('q1', 'A', true),
      a('q2', 'A', true),
      a('q3', 'A', true),
      a('q4', 'A', true),
    ];
    const { strongPatterns } = buildErrorPatterns(answers, questions);
    expect(strongPatterns[5]).toEqual([{ tag: 'word-form', count: 3 }]);
  });

  it('returns empty object when no Part has ≥2 correct subskill hits', () => {
    const questions = [q(5, 'q1', { tags: ['word-form'] })];
    const answers = [a('q1', 'A', true)];
    const { strongPatterns } = buildErrorPatterns(answers, questions);
    expect(strongPatterns).toEqual({});
  });
});

describe('buildErrorPatterns — edge cases', () => {
  it('empty answers → empty result', () => {
    const out = buildErrorPatterns([], []);
    expect(out.errorBreakdown).toEqual({});
    expect(out.wrongQuestionDetails).toEqual([]);
    expect(out.strongPatterns).toEqual({});
  });

  it('answer without matching question → skipped', () => {
    const questions = [q(5, 'q1')];
    const answers = [a('q-missing', 'A', false), a('q1', 'B', false)];
    const out = buildErrorPatterns(answers, questions);
    expect(out.errorBreakdown[5].wrongCount).toBe(1);
  });
});

describe('detectEmptyAttempt', () => {
  const r = (totalQuestions, answers, accuracy) => ({
    totalQuestions,
    answers,
    accuracy,
  });

  it('totalQuestions=0 → empty', () => {
    const out = detectEmptyAttempt(r(0, [], 0));
    expect(out.isEmpty).toBe(true);
  });

  it('answered <20% → empty', () => {
    const answers = Array.from({ length: 200 }, (_, i) => ({
      selected: i < 30 ? 'A' : null, // 30/200 = 15%
    }));
    const out = detectEmptyAttempt(r(200, answers, 10));
    expect(out.isEmpty).toBe(true);
    expect(out.answeredCount).toBe(30);
  });

  it('answered 50% but accuracy 4% → empty (accuracy threshold)', () => {
    const answers = Array.from({ length: 200 }, () => ({ selected: 'A' }));
    const out = detectEmptyAttempt(r(200, answers, 4));
    expect(out.isEmpty).toBe(true);
  });

  it('answered 50% with accuracy 60% → not empty', () => {
    const answers = Array.from({ length: 200 }, (_, i) => ({
      selected: i < 100 ? 'A' : null,
    }));
    const out = detectEmptyAttempt(r(200, answers, 60));
    expect(out.isEmpty).toBe(false);
    expect(out.answeredCount).toBe(100);
  });

  it('all answered + decent accuracy → not empty', () => {
    const answers = Array.from({ length: 200 }, () => ({ selected: 'A' }));
    const out = detectEmptyAttempt(r(200, answers, 75));
    expect(out.isEmpty).toBe(false);
  });
});

describe('buildEmptyAttemptAnalysis', () => {
  it('returns analysis with single weakness + single rec', () => {
    const out = buildEmptyAttemptAnalysis({ answeredCount: 1, total: 200 });
    expect(out.strengths).toEqual([]);
    expect(out.weaknesses).toHaveLength(1);
    expect(out.weaknesses[0]).toContain('199/200');
    expect(out.recommendations).toHaveLength(1);
    expect(out.recommendations[0]).toMatchObject({
      priority: 'high',
      targetPart: null,
    });
    expect(out.estimatedTargetWeeks).toBe(0);
  });

  it('does not crash with 0 answered', () => {
    const out = buildEmptyAttemptAnalysis({ answeredCount: 0, total: 200 });
    expect(out.weaknesses[0]).toContain('200/200');
  });
});
