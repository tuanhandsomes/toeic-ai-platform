/**
 * TOEIC scoring service.
 *
 * Quy đổi raw correct (0-100 mỗi kỹ năng) → scaled score (5-495 mỗi kỹ năng).
 * Bảng quy đổi là ước lượng (ETS không công bố chính xác công thức).
 * Sai số ±20 điểm là chấp nhận được. Xem docs/02-toeic-structure.md mục 4.
 */

// Mỗi entry: [số câu đúng tối thiểu, điểm scaled trung bình của khoảng đó]
// Sắp xếp giảm dần để tra cứu nhanh
const LISTENING_TABLE = [
  [100, 495], [95, 488], [90, 465], [85, 435], [80, 400], [75, 365],
  [70, 335], [65, 305], [60, 275], [55, 245], [50, 215], [45, 185],
  [40, 155], [35, 125], [30, 95], [25, 70], [20, 50], [10, 30], [0, 5],
];

const READING_TABLE = [
  [100, 495], [95, 485], [90, 460], [85, 430], [80, 397], [75, 365],
  [70, 332], [65, 300], [60, 270], [55, 237], [50, 205], [45, 175],
  [40, 145], [35, 115], [30, 85], [25, 60], [20, 40], [10, 22], [0, 5],
];

const lookupScore = (table, correct) => {
  const c = Math.max(0, Math.min(100, Math.round(correct)));
  for (const [minCorrect, score] of table) {
    if (c >= minCorrect) return score;
  }
  return 5;
};

/**
 * Phân loại Part:
 * Part 1-4 = Listening (100 câu tổng)
 * Part 5-7 = Reading  (100 câu tổng)
 */
export const isListeningPart = (part) => part >= 1 && part <= 4;
export const isReadingPart = (part) => part >= 5 && part <= 7;

/**
 * Chấm 1 bài thi.
 *
 * @param {Object} params
 * @param {Array<{questionId, part, correctAnswer, selected}>} params.gradedAnswers
 *        Đáp án đã match với question (đã có part + correctAnswer).
 * @param {'full' | 'part'} params.testType
 * @returns {Object} { correctCount, totalQuestions, accuracy, scoreListening, scoreReading, scoreTotal, partBreakdown, answers }
 */
export const gradeTest = ({ gradedAnswers, testType }) => {
  const partBreakdown = {
    part1: { correct: 0, total: 0 }, part2: { correct: 0, total: 0 },
    part3: { correct: 0, total: 0 }, part4: { correct: 0, total: 0 },
    part5: { correct: 0, total: 0 }, part6: { correct: 0, total: 0 },
    part7: { correct: 0, total: 0 },
  };

  let listeningCorrect = 0, listeningTotal = 0;
  let readingCorrect = 0, readingTotal = 0;
  let correctCount = 0;

  const answers = gradedAnswers.map((a) => {
    const isCorrect = a.selected != null && a.selected === a.correctAnswer;
    const partKey = `part${a.part}`;
    partBreakdown[partKey].total += 1;

    if (isCorrect) {
      partBreakdown[partKey].correct += 1;
      correctCount += 1;
    }

    if (isListeningPart(a.part)) {
      listeningTotal += 1;
      if (isCorrect) listeningCorrect += 1;
    } else if (isReadingPart(a.part)) {
      readingTotal += 1;
      if (isCorrect) readingCorrect += 1;
    }

    return {
      questionId: a.questionId,
      selected: a.selected,
      isCorrect,
      timeSpentSec: a.timeSpentSec || 0,
    };
  });

  const totalQuestions = gradedAnswers.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let scoreListening = 0;
  let scoreReading = 0;
  let scoreTotal = 0;

  if (testType === 'full') {
    // Full Test (200 câu) — dùng bảng quy đổi ETS (non-linear curve).
    // Quy đổi raw correct sang thang 100 câu chuẩn của mỗi section rồi tra bảng.
    const listeningNormalized = listeningTotal > 0
      ? Math.round((listeningCorrect / listeningTotal) * 100)
      : 0;
    const readingNormalized = readingTotal > 0
      ? Math.round((readingCorrect / readingTotal) * 100)
      : 0;

    scoreListening = lookupScore(LISTENING_TABLE, listeningNormalized);
    scoreReading = lookupScore(READING_TABLE, readingNormalized);
    scoreTotal = scoreListening + scoreReading;
  } else {
    // Practice (1 Part) — công thức tuyến tính 5 điểm/câu, đồng bộ với max
    // proportional của Part (Part X câu chuẩn × 5 ≈ Part X / 100 × 495 Listening
    // hoặc Reading).
    //
    // Ví dụ:
    //   Part 1 (max 30):   1/6 → 5đ,  3/6 → 15đ,  6/6 → 30đ
    //   Part 7 (max 270):  20/54 → 100đ,  40/54 → 200đ
    //
    // KHÔNG dùng lookup ETS như Full Test vì:
    //   - Không đủ data 100 câu để curve có ý nghĩa
    //   - Curve phi tuyến + scale × % → kết quả phản trực giác (vd 1/6 → 2đ)
    //   - User quen tính nhẩm "1 câu = 5 điểm"
    scoreListening = listeningCorrect * 5;
    scoreReading = readingCorrect * 5;
    scoreTotal = scoreListening + scoreReading;
  }

  return {
    answers,
    totalQuestions,
    correctCount,
    accuracy,
    scoreListening,
    scoreReading,
    scoreTotal,
    partBreakdown,
  };
};
