import { useEffect, useRef } from 'react';
import { Check, Flag, Headphones, Info } from 'lucide-react';
import { PART_TITLES, PART_DIRECTIONS, parsePassageRange, buildPassagePrompt } from '../../constants/toeic.js';

const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || '';
const toMediaUrl = (url) => (url && url.startsWith('/') ? `${MEDIA_BASE}${url}` : url);

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
  globalNumber,
  isFirstOfPart,
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

  const passageRange = hasImage ? parsePassageRange(content.imageUrl) : null;
  const passagePrompt = buildPassagePrompt(passageRange);

  // Khối hướng dẫn Part — chỉ hiện ở câu đầu tiên của Part trong test
  const partDirectionsBlock = isFirstOfPart && PART_DIRECTIONS[part] ? (
    <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50/60 px-4 py-3 flex gap-3">
      <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-primary-900 leading-relaxed">
        <span className="font-semibold">{PART_TITLES[part]}.</span>{' '}
        {PART_DIRECTIONS[part]}
      </p>
    </div>
  ) : null;

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
        {partDirectionsBlock}

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider">
              {PART_TITLES[part]}
            </span>
            <h2 className="mt-2 text-xl font-heading font-bold text-slate-900">
              Câu {globalNumber}
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
                  alt={`Câu ${globalNumber}`}
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
              Chọn đáp án
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
      {partDirectionsBlock}

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-wider">
            {PART_TITLES[part] || `Part ${part}`}
          </span>
          <h2 className="mt-2 text-xl font-heading font-bold text-slate-900">
            Câu {globalNumber}
          </h2>
        </div>
        {flagButton}
      </div>

      {hasImage && (
        <div className="mb-5 max-w-2xl">
          {passagePrompt && (
            <p className="text-sm font-medium text-slate-700 mb-2">{passagePrompt}</p>
          )}
          <div className="rounded-lg overflow-hidden bg-slate-100">
            {content.imageUrl.split(';').map((u, i) => (
              <img
                key={u + i}
                src={toMediaUrl(u.trim())}
                alt={`Đoạn văn câu ${globalNumber}${content.imageUrl.includes(';') ? ` (phần ${i + 1})` : ''}`}
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
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
