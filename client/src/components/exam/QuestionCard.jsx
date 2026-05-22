import { useEffect, useRef } from 'react';
import { Check, Flag, Headphones } from 'lucide-react';

const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || '';
const toMediaUrl = (url) => (url && url.startsWith('/') ? `${MEDIA_BASE}${url}` : url);

const PART_LABELS = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Đoạn hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn',
  7: 'Part 7 — Đọc hiểu',
};

// Part 1-2: hide option text (user hears, picks letter). Part 3-7: show full text.
const HIDE_OPTION_TEXT_PARTS = new Set([1, 2]);

function useAutoPlayAudio(audioRef, src) {
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) return;
    el.load();
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      // Autoplay may be blocked until first user interaction; fail silently.
      p.catch(() => {});
    }
  }, [src, audioRef]);
}

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
  const hideOptionText = HIDE_OPTION_TEXT_PARTS.has(part);

  const audioRef = useRef(null);
  useAutoPlayAudio(audioRef, content?.audioUrl);

  const flagButton = (
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
  );

  const optionList = (
    <fieldset className="space-y-3">
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
            {hideOptionText ? (
              <span className="flex-1 text-slate-500 leading-relaxed pt-1">({opt.key})</span>
            ) : (
              <span className="flex-1 text-slate-900 leading-relaxed pt-1">{opt.text}</span>
            )}
            {isSelected && <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />}
          </button>
        );
      })}
    </fieldset>
  );

  // ─── Part 1 layout: 2 columns (audio+image left | options right) ───
  if (part === 1) {
    return (
      <article className="bg-white rounded-card shadow-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider">
              {PART_LABELS[part]}
            </span>
            <h2 className="mt-2 text-xl font-heading font-bold text-slate-900">
              Câu {index + 1} / {total}
            </h2>
          </div>
          {flagButton}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: audio + image */}
          <div className="space-y-4">
            {hasAudio && (
              <audio
                ref={audioRef}
                controls
                src={toMediaUrl(content.audioUrl)}
                className="w-full"
              />
            )}
            {hasImage && (
              <div className="rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={toMediaUrl(content.imageUrl)}
                  alt={`Câu ${index + 1}`}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT: options only (no text shown for Part 1) */}
          <div>
            <h3 className="text-base font-semibold text-slate-700 mb-3">
              Question {index + 1}
            </h3>
            {optionList}
          </div>
        </div>
      </article>
    );
  }

  // ─── Default layout for Part 2-7 ───
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
        {flagButton}
      </div>

      {hasImage && (
        <div className="mb-5 rounded-lg overflow-hidden bg-slate-100 max-w-2xl">
          <img
            src={toMediaUrl(content.imageUrl)}
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
            ref={audioRef}
            controls
            src={toMediaUrl(content.audioUrl)}
            className="w-full"
            onError={(e) => {
              e.target.style.opacity = '0.5';
              e.target.title = 'Audio sample sẽ được cập nhật ở giai đoạn polish';
            }}
          />
        </div>
      )}

      {hasText && !hideOptionText && (
        <div className="mb-5 max-w-3xl prose prose-slate">
          <p className="text-slate-900 text-lg leading-relaxed whitespace-pre-wrap">
            {content.text}
          </p>
        </div>
      )}

      <div className="max-w-2xl">{optionList}</div>
    </article>
  );
}
