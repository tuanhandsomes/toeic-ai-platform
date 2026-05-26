import { Flag } from 'lucide-react';

/**
 * Card hiển thị điểm TOEIC quy đổi + tách Listening/Reading hoặc Part cụ thể.
 *
 * Layout:
 *   - Trên (nền trắng): icon cờ + "Điểm" + số điểm to
 *   - Dưới (nền xám): grid 2 cột Listening | Reading (Full Test)
 *                     hoặc 1 cột "Listening Part X" / "Reading Part X" (Practice)
 *
 * Phân bổ điểm Part-specific cho Practice:
 *   Mỗi section TOEIC chuẩn = 495 điểm / 100 câu = 4.95 điểm/câu.
 *   → Mỗi Part max scaled = số câu chuẩn × 4.95.
 *   → Mỗi câu đúng trong Practice = 5 điểm (rounding nhẹ cho đẹp).
 *
 * Câu chuẩn theo Part (TOEIC L&R 2026):
 *   Part 1: 6, Part 2: 25, Part 3: 39, Part 4: 30
 *   Part 5: 30, Part 6: 16, Part 7: 54
 */

const PART_STANDARD_QUESTIONS = {
  1: 6, 2: 25, 3: 39, 4: 30,
  5: 30, 6: 16, 7: 54,
};

// Max scaled score cho từng Part — proportional của 495/section.
// Round nhẹ cho dễ nhìn.
const PART_MAX_SCALED = {
  1: 30,   // 6  × 4.95 ≈ 30
  2: 124,  // 25 × 4.95 ≈ 124
  3: 193,  // 39 × 4.95 ≈ 193
  4: 149,  // 30 × 4.95 ≈ 149
  5: 149,  // 30 × 4.95 ≈ 149
  6: 79,   // 16 × 4.95 ≈ 79
  7: 268,  // 54 × 4.95 ≈ 268
};

const PART_LABEL = (part) => {
  const section = part <= 4 ? 'Listening' : 'Reading';
  return `${section} Part ${part}`;
};

export default function ScoreCard({ result, isFullTest, compact = false }) {
  const listeningCorrect =
    (result.partBreakdown?.part1?.correct || 0) +
    (result.partBreakdown?.part2?.correct || 0) +
    (result.partBreakdown?.part3?.correct || 0) +
    (result.partBreakdown?.part4?.correct || 0);
  const listeningTotal =
    (result.partBreakdown?.part1?.total || 0) +
    (result.partBreakdown?.part2?.total || 0) +
    (result.partBreakdown?.part3?.total || 0) +
    (result.partBreakdown?.part4?.total || 0);
  const readingCorrect =
    (result.partBreakdown?.part5?.correct || 0) +
    (result.partBreakdown?.part6?.correct || 0) +
    (result.partBreakdown?.part7?.correct || 0);
  const readingTotal =
    (result.partBreakdown?.part5?.total || 0) +
    (result.partBreakdown?.part6?.total || 0) +
    (result.partBreakdown?.part7?.total || 0);

  const hasListening = listeningTotal > 0;
  const hasReading = readingTotal > 0;

  // Practice: tìm Part duy nhất có data → dùng label + max riêng của Part đó.
  let practiceParts = [];
  if (!isFullTest) {
    practiceParts = Object.entries(result.partBreakdown || {})
      .filter(([, v]) => v && v.total > 0)
      .map(([key, v]) => ({
        part: Number(key.replace('part', '')),
        correct: v.correct,
        total: v.total,
      }));
  }

  return (
    <div className="rounded-card border border-slate-200 overflow-hidden bg-white">
      {/* TOP — Điểm tổng */}
      <div className={`bg-white text-center ${compact ? 'py-5' : 'py-8'}`}>
        <Flag
          className={`${
            compact ? 'w-7 h-7' : 'w-10 h-10'
          } text-yellow-500 mx-auto mb-1`}
          fill="currentColor"
        />
        <p
          className={`text-slate-500 uppercase tracking-wider ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          Điểm TOEIC
        </p>
        <p
          className={`font-mono font-bold text-slate-900 leading-none ${
            compact ? 'text-4xl mt-2' : 'text-6xl mt-3'
          }`}
        >
          {result.scoreTotal}
        </p>
      </div>

      {/* BOTTOM — Section / Part breakdown */}
      <div
        className={`bg-slate-50 border-t border-slate-200 ${
          compact ? 'px-4 py-4' : 'px-6 py-5'
        }`}
      >
        {isFullTest ? (
          <div
            className={
              hasListening && hasReading
                ? 'grid grid-cols-2 gap-4'
                : 'grid grid-cols-1'
            }
          >
            {hasListening && (
              <SectionStat
                label="Listening"
                scaledScore={result.scoreListening}
                sectionMax={495}
                correct={listeningCorrect}
                total={listeningTotal}
                compact={compact}
              />
            )}
            {hasReading && (
              <SectionStat
                label="Reading"
                scaledScore={result.scoreReading}
                sectionMax={495}
                correct={readingCorrect}
                total={readingTotal}
                compact={compact}
              />
            )}
          </div>
        ) : (
          // Practice — Part-specific label + max riêng. Scaled score lấy từ BE
          // (đã quy đổi bằng bảng ETS, scaled theo proportional của Part).
          <div
            className={
              practiceParts.length > 1
                ? 'grid grid-cols-2 gap-4'
                : 'grid grid-cols-1'
            }
          >
            {practiceParts.map((p) => {
              // BE đã tính: scoreListening = sum scaled các Part 1-4, scoreReading = sum Part 5-7
              // Practice luôn chỉ 1 Part nên scoreListening (hoặc scoreReading) = Part scaled.
              const partScaled = p.part <= 4 ? result.scoreListening : result.scoreReading;
              const partMax =
                PART_MAX_SCALED[p.part] ||
                (PART_STANDARD_QUESTIONS[p.part] || p.total) * 5;
              return (
                <SectionStat
                  key={p.part}
                  label={PART_LABEL(p.part)}
                  scaledScore={partScaled}
                  sectionMax={partMax}
                  correct={p.correct}
                  total={p.total}
                  compact={compact}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionStat({ label, scaledScore, sectionMax, correct, total, compact }) {
  return (
    <div className="text-center">
      <p
        className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} mb-0.5`}
      >
        {label}:
      </p>
      <p
        className={`font-mono font-semibold text-slate-900 ${
          compact ? 'text-xl' : 'text-2xl'
        }`}
      >
        {scaledScore}
        {sectionMax != null && (
          <span className="text-slate-400 font-normal">/{sectionMax}</span>
        )}
      </p>
      <p
        className={`text-slate-600 ${compact ? 'text-xs mt-1.5' : 'text-sm mt-2'} mb-0.5`}
      >
        Trả lời đúng:
      </p>
      <p
        className={`font-mono font-semibold text-slate-700 ${
          compact ? 'text-base' : 'text-xl'
        }`}
      >
        {correct}/{total}
      </p>
    </div>
  );
}
