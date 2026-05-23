import { Flag } from 'lucide-react';

/**
 * Answer sheet showing all question circles.
 *
 * @param {Object} props
 * @param {Array} props.questions       Array of question objects (need _id, part)
 * @param {Array<number>} [props.globalNumbers]  Global TOEIC numbers (1-200) parallel to questions. If omitted, falls back to idx+1.
 * @param {Object} props.answers        { [questionId]: 'A' | 'B' | 'C' | 'D' | null }
 * @param {Set} props.flagged           Set of questionIds flagged for review
 * @param {number} props.currentIndex   Index of current question (0-based)
 * @param {Function} props.onJump       (index) => void
 */
export default function AnswerSheet({ questions, globalNumbers, answers, flagged, currentIndex, onJump }) {
  const answered = questions.filter((q) => answers[q._id] != null).length;
  const total = questions.length;
  const flaggedCount = flagged.size;

  return (
    <div className="bg-white border border-slate-200 rounded-card p-4 sticky top-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold">Phiếu trả lời</h3>
      </div>

      <div className="text-xs text-slate-600 mb-3 grid grid-cols-3 gap-2">
        <div>
          <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mr-1.5" />
          Đã làm: <strong>{answered}</strong>
        </div>
        <div>
          <span className="inline-block w-2 h-2 rounded-full border border-slate-300 bg-white mr-1.5" />
          Chưa: <strong>{total - answered}</strong>
        </div>
        <div>
          <Flag className="inline w-3 h-3 text-tertiary-500 mr-1" />
          Đánh dấu: <strong>{flaggedCount}</strong>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-[60vh] overflow-y-auto">
        {questions.map((q, idx) => {
          const isAnswered = answers[q._id] != null;
          const isCurrent = idx === currentIndex;
          const isFlagged = flagged.has(q._id);
          const number = globalNumbers?.[idx] ?? idx + 1;

          let cls = 'relative w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ';
          if (isCurrent) {
            cls += 'bg-primary-500 text-white ring-2 ring-primary-300 ring-offset-1';
          } else if (isAnswered) {
            cls += 'bg-primary-100 text-primary-700 hover:bg-primary-200';
          } else {
            cls += 'bg-white border border-slate-200 text-slate-500 hover:border-primary-400';
          }

          return (
            <button
              key={q._id}
              type="button"
              onClick={() => onJump(idx)}
              className={cls}
              title={`Câu ${number}`}
            >
              {number}
              {isFlagged && (
                <Flag className="absolute -top-1 -right-1 w-3 h-3 text-tertiary-500 fill-tertiary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
