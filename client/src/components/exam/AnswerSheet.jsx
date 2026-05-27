import { Flag } from 'lucide-react';

/**
 * Right column — question navigation panel.
 * Grouped by Part with legend at the top.
 */
export default function AnswerSheet({
  questions,
  globalNumbers,
  answers,
  flagged,
  currentIndex,
  onJump,
}) {
  // Group consecutive questions by part so each Part shows its own grid.
  const groups = [];
  questions.forEach((q, idx) => {
    const last = groups[groups.length - 1];
    if (last && last.part === q.part) {
      last.items.push({ q, idx });
    } else {
      groups.push({ part: q.part, items: [{ q, idx }] });
    }
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-elevated p-5 h-full flex flex-col">
      <h3 className="font-heading font-semibold text-slate-900 mb-3">
        Phiếu trả lời
      </h3>

      {/* Legend */}
      <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Câu hỏi đã hoàn thành
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Câu hỏi cần xem lại
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          Câu hỏi hiện tại
        </li>
      </ul>

      {/* Groups */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.part}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Part {g.part}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {g.items.map(({ q, idx }) => {
                const isAnswered = answers[q._id] != null;
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged.has(q._id);
                const number = globalNumbers?.[idx] ?? idx + 1;

                let cls =
                  'relative h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-colors border ';
                if (isCurrent) {
                  cls +=
                    'bg-primary-50 text-primary-700 border-primary-400 ring-2 ring-primary-200';
                } else if (isFlagged) {
                  cls += 'bg-amber-50 text-amber-700 border-amber-300';
                } else if (isAnswered) {
                  cls += 'bg-emerald-50 text-emerald-700 border-emerald-300';
                } else {
                  cls +=
                    'bg-white border-slate-200 text-slate-500 hover:border-primary-300';
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
                    {isFlagged && !isCurrent && (
                      <Flag className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
