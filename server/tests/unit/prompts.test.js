import { describe, it, expect } from 'vitest';
import {
  buildAnalysisPrompt,
  ANALYSIS_JSON_SCHEMA,
  PROMPT_VERSION,
} from '../../src/utils/prompts.js';

const baseResult = (overrides = {}) => ({
  testType: 'full',
  totalQuestions: 200,
  correctCount: 150,
  accuracy: 75,
  durationSec: 7200,
  scoreTotal: 700,
  scoreListening: 350,
  scoreReading: 350,
  partBreakdown: {
    part1: { correct: 5, total: 6 },
    part2: { correct: 20, total: 25 },
    part3: { correct: 30, total: 39 },
    part4: { correct: 25, total: 30 },
    part5: { correct: 25, total: 30 },
    part6: { correct: 12, total: 16 },
    part7: { correct: 33, total: 54 },
  },
  ...overrides,
});

describe('PROMPT_VERSION + ANALYSIS_JSON_SCHEMA', () => {
  it('exposes a version string', () => {
    expect(typeof PROMPT_VERSION).toBe('string');
    expect(PROMPT_VERSION).toMatch(/^v\d/);
  });

  it('schema is strict with all required fields', () => {
    const s = ANALYSIS_JSON_SCHEMA.json_schema;
    expect(s.strict).toBe(true);
    expect(s.schema.required).toEqual(
      expect.arrayContaining([
        'strengths',
        'weaknesses',
        'recommendations',
        'estimatedTargetWeeks',
      ]),
    );
    expect(s.schema.additionalProperties).toBe(false);
  });

  it('recommendation item requires targetPart with nullable integer', () => {
    const rec = ANALYSIS_JSON_SCHEMA.json_schema.schema.properties.recommendations.items;
    expect(rec.required).toEqual(
      expect.arrayContaining(['topic', 'action', 'priority', 'targetPart']),
    );
    expect(rec.properties.targetPart.type).toEqual(['integer', 'null']);
  });
});

describe('buildAnalysisPrompt — Full Test', () => {
  it('returns systemPrompt + userPrompt strings', () => {
    const { systemPrompt, userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      user: { targetScore: 800 },
    });
    expect(typeof systemPrompt).toBe('string');
    expect(typeof userPrompt).toBe('string');
    expect(systemPrompt.length).toBeGreaterThan(500);
    expect(userPrompt.length).toBeGreaterThan(100);
  });

  it('Full Test prompt mentions DỮ LIỆU FULL TEST + target score', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      user: { targetScore: 850 },
    });
    expect(userPrompt).toContain('DỮ LIỆU FULL TEST');
    expect(userPrompt).toContain('850');
    expect(userPrompt).toContain('700/990');
  });

  it('includes scoring leverage data block when there are wrong questions', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      user: { targetScore: 800 },
    });
    expect(userPrompt).toMatch(/ƯU TIÊN ĐIỂM ĐỂ ĐẠT MỤC TIÊU \(sắp theo/);
  });

  it('omits scoring leverage data block when accuracy is 100%', () => {
    const allRight = baseResult({
      correctCount: 200,
      accuracy: 100,
      scoreTotal: 990,
      scoreListening: 495,
      scoreReading: 495,
      partBreakdown: {
        part1: { correct: 6, total: 6 },
        part2: { correct: 25, total: 25 },
        part3: { correct: 39, total: 39 },
        part4: { correct: 30, total: 30 },
        part5: { correct: 30, total: 30 },
        part6: { correct: 16, total: 16 },
        part7: { correct: 54, total: 54 },
      },
    });
    const { userPrompt } = buildAnalysisPrompt({
      result: allRight,
      user: { targetScore: 800 },
    });
    expect(userPrompt).not.toMatch(/ƯU TIÊN ĐIỂM ĐỂ ĐẠT MỤC TIÊU \(sắp theo/);
  });

  it('high score → guidance includes XUẤT SẮC tier', () => {
    const high = baseResult({ correctCount: 190, accuracy: 95 });
    const { userPrompt } = buildAnalysisPrompt({
      result: high,
      user: { targetScore: 800 },
    });
    expect(userPrompt).toContain('XUẤT SẮC');
  });

  it('low score → guidance includes CẦN CẢI THIỆN tier', () => {
    const low = baseResult({ correctCount: 80, accuracy: 40 });
    const { userPrompt } = buildAnalysisPrompt({
      result: low,
      user: { targetScore: 800 },
    });
    expect(userPrompt).toContain('CẦN CẢI THIỆN');
  });

  it('defaults targetScore to 700 when user not provided', () => {
    const { userPrompt } = buildAnalysisPrompt({ result: baseResult() });
    expect(userPrompt).toContain('700');
  });
});

describe('buildAnalysisPrompt — Practice', () => {
  const practiceResult = (overrides = {}) => ({
    testType: 'part',
    totalQuestions: 30,
    correctCount: 20,
    accuracy: 67,
    durationSec: 1800,
    scoreTotal: 100,
    scoreListening: 0,
    scoreReading: 100,
    partBreakdown: {
      part1: { correct: 0, total: 0 },
      part2: { correct: 0, total: 0 },
      part3: { correct: 0, total: 0 },
      part4: { correct: 0, total: 0 },
      part5: { correct: 20, total: 30 },
      part6: { correct: 0, total: 0 },
      part7: { correct: 0, total: 0 },
    },
    ...overrides,
  });

  it('Practice prompt mentions DỮ LIỆU PRACTICE + the Part being practiced', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: practiceResult(),
      user: { targetScore: 800 },
    });
    expect(userPrompt).toContain('DỮ LIỆU PRACTICE');
    expect(userPrompt).toContain('Part 5');
  });

  it('Practice prompt instructs estimatedTargetWeeks to be 0', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: practiceResult(),
    });
    expect(userPrompt).toContain('estimatedTargetWeeks: TRẢ 0');
  });
});

describe('buildAnalysisPrompt — wrongQuestionDetails injection', () => {
  it('injects wrong question data lines when details provided', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      user: { targetScore: 800 },
      wrongQuestionDetails: [
        {
          globalNum: 105,
          part: 5,
          difficulty: 'hard',
          isSlow: true,
          timeSpentSec: 45,
          selected: 'B',
          correct: 'C',
          selectedText: 'successful',
          correctText: 'success',
          primaryTag: '',
          stemSnippet: 'The new manager will be ___ for the marketing team.',
        },
      ],
    });
    // Data section header has "(top N — so sánh ..." which is unique vs the
    // instruction text that just references the section name.
    expect(userPrompt).toMatch(/DANH SÁCH CÂU SAI CỤ THỂ \(top 1/);
    expect(userPrompt).toContain('- Câu 105');
    expect(userPrompt).toContain('successful');
    expect(userPrompt).toContain('success');
  });

  it('omits wrong question data lines when no details', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      user: { targetScore: 800 },
    });
    // The data header pattern (with "(top") should be absent — instruction text
    // referencing the section name without "(top" may still appear.
    expect(userPrompt).not.toMatch(/DANH SÁCH CÂU SAI CỤ THỂ \(top/);
  });

  it('shows "Bỏ trống" when selected is null', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      wrongQuestionDetails: [
        {
          globalNum: 50,
          part: 3,
          difficulty: 'medium',
          isSlow: false,
          timeSpentSec: 0,
          selected: null,
          correct: 'A',
          selectedText: '',
          correctText: 'Some text',
          primaryTag: '',
          stemSnippet: '',
        },
      ],
    });
    expect(userPrompt).toContain('Bỏ trống');
  });
});

describe('buildAnalysisPrompt — strongPatterns injection', () => {
  it('injects strong patterns data lines when present', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      strongPatterns: {
        5: [
          { tag: 'word-form', count: 6 },
          { tag: 'preposition', count: 4 },
        ],
      },
    });
    expect(userPrompt).toMatch(/KỸ NĂNG ĐÃ VỮNG \(subskill làm đúng/);
    expect(userPrompt).toContain('word-form (đúng 6 câu)');
    expect(userPrompt).toContain('preposition (đúng 4 câu)');
  });

  it('omits strong patterns data lines when empty', () => {
    const { userPrompt } = buildAnalysisPrompt({
      result: baseResult(),
      strongPatterns: {},
    });
    expect(userPrompt).not.toMatch(/KỸ NĂNG ĐÃ VỮNG \(subskill/);
  });
});
