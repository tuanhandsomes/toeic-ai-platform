import { Check, Flag, Headphones, Image as ImageIcon } from 'lucide-react';

const PART_LABELS = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Đoạn hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn',
  7: 'Part 7 — Đọc hiểu',
};

/**
 * Display a question + collect user's answer.
 *
 * @param {Object} props
 * @param {Object} props.question     Question object (without correctAnswer in taking mode)
 * @param {number} props.index        0-based index in test
 * @param {number} props.total        Total questions
 * @param {string|null} props.selected User's current answer key ('A'..'D' or null)
 * @param {boolean} props.isFlagged   Whether this question is flagged
 * @param {Function} props.onSelect   (key) => void
 * @param {Function} props.onToggleFlag () => void
 */
export default function QuestionCard({
  question,
  index,
  total,
  selected,
  isFlagged,
  onSelect,
  onToggleFlag,
}) {
  const { part, content, options } = question;
  const hasAudio = !!content?.audioUrl;
  const hasImage = !!content?.imageUrl;
  const hasText = !!content?.text;

  return (
    <article className="bg-white rounded-card shadow-card p-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider">
            {PART_LABELS[part] || `Part ${part}`}
          </span>
          <h2 className="mt-2 text-xl font-heading font-bold text-slate-900">
            Câu {index + 1} / {total}
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isFlagged
              ? 'bg-tertiary-100 text-tertiary-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Đánh dấu xem lại"
        >
          <Flag className={`w-4 h-4 ${isFlagged ? 'fill-tertiary-500' : ''}`} />
          {isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}
        </button>
      </div>

      {hasImage && (
        <div className="mb-5 rounded-lg overflow-hidden bg-slate-100 max-w-2xl">
          <img
            src={content.imageUrl}
            alt={`Câu ${index + 1}`}
            className="w-full h-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="p-12 text-center text-slate-400 flex flex-col items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>(Hình ảnh sẽ được cập nhật)</span></div>';
            }}
          />
        </div>
      )}

      {hasAudio && (
        <div className="mb-5 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
            <Headphones className="w-4 h-4" />
            <span>Audio</span>
          </div>
          <audio
            controls
            src={content.audioUrl}
            className="w-full"
            onError={(e) => {
              e.target.style.opacity = '0.5';
              e.target.title = 'Audio sample sẽ được cập nhật ở giai đoạn polish';
            }}
          />
        </div>
      )}

      {hasText && (
        <div className="mb-5 max-w-3xl prose prose-slate">
          <p className="text-slate-900 text-lg leading-relaxed whitespace-pre-wrap">
            {content.text}
          </p>
        </div>
      )}

      <fieldset className="space-y-3 max-w-2xl">
        <legend className="sr-only">Chọn đáp án</legend>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border-2 transition-colors ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {opt.key}
              </span>
              <span className="flex-1 text-slate-900 leading-relaxed pt-1">{opt.text}</span>
              {isSelected && <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />}
            </button>
          );
        })}
      </fieldset>
    </article>
  );
}
