import { describe, it, expect } from 'vitest';
import {
  gradeTest,
  isListeningPart,
  isReadingPart,
} from '../../src/services/scoringService.js';

// Helper build answer rows matching scoringService input shape
const ans = (part, correct, selected, timeSpentSec = 0) => ({
  questionId: `q-${part}-${Math.random()}`,
  part,
  correctAnswer: correct,
  selected,
  timeSpentSec,
});

describe('isListeningPart / isReadingPart', () => {
  it('parts 1-4 are Listening', () => {
    [1, 2, 3, 4].forEach((p) => {
      expect(isListeningPart(p)).toBe(true);
      expect(isReadingPart(p)).toBe(false);
    });
  });

  it('parts 5-7 are Reading', () => {
    [5, 6, 7].forEach((p) => {
      expect(isListeningPart(p)).toBe(false);
      expect(isReadingPart(p)).toBe(true);
    });
  });
});

describe('gradeTest — Practice (type=part)', () => {
  it('Practice score = correctCount × 5; max = totalQuestions × 5', () => {
    // Part 1 — 6 câu, đúng 5
    const gradedAnswers = [
      ans(1, 'A', 'A'),
      ans(1, 'B', 'B'),
      ans(1, 'C', 'C'),
      ans(1, 'D', 'D'),
      ans(1, 'A', 'A'),
      ans(1, 'B', 'A'), // sai
    ];
    const r = gradeTest({ gradedAnswers, testType: 'part' });
    expect(r.correctCount).toBe(5);
    expect(r.totalQuestions).toBe(6);
    expect(r.accuracy).toBe(83);
    expect(r.scoreListening).toBe(25);
    expect(r.scoreReading).toBe(0);
    expect(r.scoreTotal).toBe(25);
    expect(r.partBreakdown.part1).toEqual({ correct: 5, total: 6 });
  });

  it('Practice all-correct gives full Part max (Part 7: 54 × 5 = 270)', () => {
    const gradedAnswers = Array.from({ length: 54 }, () => ans(7, 'A', 'A'));
    const r = gradeTest({ gradedAnswers, testType: 'part' });
    expect(r.correctCount).toBe(54);
    expect(r.scoreReading).toBe(270);
    expect(r.scoreListening).toBe(0);
    expect(r.scoreTotal).toBe(270);
    expect(r.accuracy).toBe(100);
  });

  it('Practice all-wrong/blank gives 0', () => {
    const gradedAnswers = Array.from({ length: 6 }, () => ans(1, 'A', null));
    const r = gradeTest({ gradedAnswers, testType: 'part' });
    expect(r.correctCount).toBe(0);
    expect(r.scoreTotal).toBe(0);
    expect(r.accuracy).toBe(0);
  });
});

describe('gradeTest — Full Test (type=full)', () => {
  it('all-correct gives 990 (495+495)', () => {
    const listening = Array.from({ length: 100 }, () => ans(1, 'A', 'A'));
    const reading = Array.from({ length: 100 }, () => ans(5, 'A', 'A'));
    const r = gradeTest({
      gradedAnswers: [...listening, ...reading],
      testType: 'full',
    });
    expect(r.correctCount).toBe(200);
    expect(r.totalQuestions).toBe(200);
    expect(r.accuracy).toBe(100);
    expect(r.scoreListening).toBe(495);
    expect(r.scoreReading).toBe(495);
    expect(r.scoreTotal).toBe(990);
  });

  it('all-blank gives floor 5+5=10', () => {
    const listening = Array.from({ length: 100 }, () => ans(1, 'A', null));
    const reading = Array.from({ length: 100 }, () => ans(5, 'A', null));
    const r = gradeTest({
      gradedAnswers: [...listening, ...reading],
      testType: 'full',
    });
    expect(r.correctCount).toBe(0);
    expect(r.scoreListening).toBe(5);
    expect(r.scoreReading).toBe(5);
    expect(r.scoreTotal).toBe(10);
    expect(r.accuracy).toBe(0);
  });

  it('uses non-linear ETS curve: 70 L correct → 335 L scaled (not 5×70=350)', () => {
    const listening = [
      ...Array.from({ length: 70 }, () => ans(1, 'A', 'A')),
      ...Array.from({ length: 30 }, () => ans(1, 'A', 'B')),
    ];
    const reading = Array.from({ length: 100 }, () => ans(5, 'A', null));
    const r = gradeTest({
      gradedAnswers: [...listening, ...reading],
      testType: 'full',
    });
    expect(r.scoreListening).toBe(335);
  });

  it('partBreakdown counts per part correctly', () => {
    const gradedAnswers = [
      ans(1, 'A', 'A'),
      ans(1, 'A', 'B'),
      ans(2, 'A', 'A'),
      ans(5, 'A', 'A'),
      ans(7, 'A', 'B'),
    ];
    const r = gradeTest({ gradedAnswers, testType: 'full' });
    expect(r.partBreakdown.part1).toEqual({ correct: 1, total: 2 });
    expect(r.partBreakdown.part2).toEqual({ correct: 1, total: 1 });
    expect(r.partBreakdown.part5).toEqual({ correct: 1, total: 1 });
    expect(r.partBreakdown.part7).toEqual({ correct: 0, total: 1 });
    expect(r.partBreakdown.part3).toEqual({ correct: 0, total: 0 });
  });
});

describe('gradeTest — answers shape', () => {
  it('returns answers with isCorrect + timeSpentSec', () => {
    const gradedAnswers = [ans(1, 'A', 'A', 12), ans(1, 'A', 'B', 8)];
    const r = gradeTest({ gradedAnswers, testType: 'part' });
    expect(r.answers).toHaveLength(2);
    expect(r.answers[0]).toMatchObject({
      selected: 'A',
      isCorrect: true,
      timeSpentSec: 12,
    });
    expect(r.answers[1]).toMatchObject({
      selected: 'B',
      isCorrect: false,
      timeSpentSec: 8,
    });
  });

  it('null selected → isCorrect false (even if correct is null)', () => {
    const gradedAnswers = [ans(1, 'A', null)];
    const r = gradeTest({ gradedAnswers, testType: 'part' });
    expect(r.answers[0].isCorrect).toBe(false);
  });

  it('empty answers array → 0/0/0 totals', () => {
    const r = gradeTest({ gradedAnswers: [], testType: 'full' });
    expect(r.totalQuestions).toBe(0);
    expect(r.correctCount).toBe(0);
    expect(r.accuracy).toBe(0);
    expect(r.scoreTotal).toBe(10); // 5 + 5 floor from lookup
  });
});
