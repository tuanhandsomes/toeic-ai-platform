import { useEffect, useRef } from 'react';
import { Check, Flag, Headphones, Info } from 'lucide-react';
import {
  PART_TITLES,
  PART_DIRECTIONS,
  parsePassageRange,
  buildPassagePrompt,
} from '../../constants/toeic.js';

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
      p.catch(() => {});
    }
  }, [src, audioRef]);
}

/**
 * LEFT COLUMN — media + reading material.
 * Audio player (if any), image/passage (if any), passage text (Part 5-7).
 * Also renders the Part-directions block on the first question of a Part.
 */
export function QuestionMedia({ question, globalNumber, isFirstOfPart }) {
  const { part, content } = question;
  const hasAudio = !!content?.audioUrl;
  const hasImage = !!content?.imageUrl;
  const hasText = !!content?.text;
  const hideOptionText = HIDE_OPTION_TEXT_PARTS.has(part);

  const audioRef = useRef(null);
  useAutoPlayAudio(audioRef, content?.audioUrl);

  const passageRange = hasImage ? parsePassageRange(content.imageUrl) : null;
  const passagePrompt = buildPassagePrompt(passageRange);

  return (
    <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 h-full overflow-hidden">
      <div className="h-full overflow-y-auto p-6 md:p-8">
      {isFirstOfPart && PART_DIRECTIONS[part] && (
        <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50/60 px-4 py-3 flex gap-3">
          <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-900 leading-relaxed">
            <span className="font-semibold">{PART_TITLES[part]}.</span>{' '}
            {PART_DIRECTIONS[part]}
          </p>
        </div>
      )}

      <h2 className="text-lg font-heading font-semibold text-slate-900 mb-4">
        Question {globalNumber}
      </h2>

      {hasAudio && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <Headphones className="w-3.5 h-3.5" />
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

      {hasImage && (
        <div className="mb-4">
          {passagePrompt && (
            <p className="text-sm font-medium text-slate-700 mb-2">{passagePrompt}</p>
          )}
          <div className="rounded-lg overflow-hidden bg-slate-100">
            {content.imageUrl.split(';').map((u, i) => (
              <img
                key={u + i}
                src={toMediaUrl(u.trim())}
                alt={`Câu ${globalNumber}${content.imageUrl.includes(';') ? ` (phần ${i + 1})` : ''}`}
                className="w-full h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      )}

      {hasText && !hideOptionText && (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">
            {content.text}
          </p>
        </div>
      )}

      {!hasAudio && !hasImage && !hasText && (
        <p className="text-sm text-slate-400 italic">
          Không có tài liệu kèm câu này.
        </p>
      )}
      </div>
    </div>
  );
}

/**
 * Single question block (header + options) — used inside QuestionOptions for both
 * single-question and grouped (Part 3/4/6/7) views.
 */
function QuestionBlock({
  question,
  globalNumber,
  selected,
  isFlagged,
  onSelect,
  onToggleFlag,
}) {
  const { part, options } = question;
  const hideOptionText = HIDE_OPTION_TEXT_PARTS.has(part);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-slate-900">
          Question {globalNumber}
        </h2>
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

      <fieldset className="space-y-3">
        <legend className="sr-only">Chọn đáp án câu {globalNumber}</legend>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-full border transition-colors ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </span>
              {hideOptionText ? (
                <span className="flex-1 text-slate-700 font-medium">({opt.key})</span>
              ) : (
                <>
                  <span className="text-slate-700 font-semibold w-5">{opt.key}</span>
                  <span className="flex-1 text-slate-900 leading-relaxed">{opt.text}</span>
                </>
              )}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

/**
 * MIDDLE COLUMN — list of question blocks.
 * For Part 1/2/5: 1 block (single question).
 * For Part 3/4/6/7 with shared passage: multiple blocks scrollable.
 *
 * @param {Object} props
 * @param {Array} props.questions       Group of questions to render (>=1)
 * @param {Array<number>} props.globalNumbers
 * @param {Object} props.answers        { questionId: 'A'|'B'|'C'|'D'|null }
 * @param {Set} props.flagged           Set of flagged questionIds
 * @param {Function} props.onSelect     (questionId, key) => void
 * @param {Function} props.onToggleFlag (questionId) => void
 */
export function QuestionOptions({
  questions,
  globalNumbers,
  answers,
  flagged,
  onSelect,
  onToggleFlag,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 h-full overflow-hidden">
      <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8">
        {questions.map((q, idx) => (
          <QuestionBlock
            key={q._id}
            question={q}
            globalNumber={globalNumbers[idx]}
            selected={answers[q._id] ?? null}
            isFlagged={flagged.has(q._id)}
            onSelect={(key) => onSelect(q._id, key)}
            onToggleFlag={() => onToggleFlag(q._id)}
          />
        ))}
      </div>
    </div>
  );
}
