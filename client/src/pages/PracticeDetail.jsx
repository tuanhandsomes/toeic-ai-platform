import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import Timer from '../components/exam/Timer.jsx';
import AnswerSheet from '../components/exam/AnswerSheet.jsx';
import { QuestionMedia, QuestionOptions } from '../components/exam/QuestionCard.jsx';
import SubmitModal from '../components/exam/SubmitModal.jsx';
import { testService } from '../services/testService.js';
import { resultService } from '../services/resultService.js';
import { useAuthStore } from '../store/authStore.js';
import { computeGlobalNumbers, parsePassageRange, parseAudioRange } from '../constants/toeic.js';

const draftKey = (userId, testId) => `exam-draft:${userId}:${testId}`;

export default function PracticeDetail() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // ?mode=practice cho Full Test → tắt countdown, không auto-submit hết giờ.
  // Cho phép user "làm lại Full Test ở chế độ luyện tập" (count-up timer).
  const isPracticeMode = searchParams.get('mode') === 'practice';
  const userId = useAuthStore((s) => s.user?._id);

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A'|'B'|'C'|'D'|null }
  const [flagged, setFlagged] = useState(() => new Set());
  const [startedAt, setStartedAt] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Per-question time tracking
  const timeSpentRef = useRef({});
  const lastTickRef = useRef(Date.now());

  // 1. Load test
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    testService
      .getById(testId)
      .then((res) => {
        if (cancelled) return;
        const t = res.data;
        setTest(t);

        // Resume from draft if exists
        const draftRaw = localStorage.getItem(draftKey(userId, testId));
        let draftStartedAt = null;
        let draftAnswers = {};
        let draftFlagged = [];
        let draftCurrentIndex = 0;
        let draftTimeSpent = {};

        let draftElapsedSec = 0;
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            draftStartedAt = draft.startedAt;
            draftAnswers = draft.answers || {};
            draftFlagged = draft.flagged || [];
            draftCurrentIndex = draft.currentIndex || 0;
            draftTimeSpent = draft.timeSpent || {};
            draftElapsedSec = draft.elapsedSec || 0;
          } catch {
            // ignore corrupt draft
          }
        }

        // Practice (elapsed): timer chỉ đếm thời gian user thực sự đang ở trang.
        // Khôi phục startedAt = NOW - elapsedSec đã lưu → Timer wall-clock liền
        // mạch với thời lượng đã làm trước đó, KHÔNG cộng dồn thời gian rời trang.
        //
        // Full Test (countdown): giữ nguyên startedAt gốc — thi thật vẫn phải
        // đếm cả khi user rời tab (auto-submit nếu hết giờ).
        const isFullTest = t.type === 'full';
        let startTime;
        if (isFullTest) {
          startTime = draftStartedAt ? new Date(draftStartedAt) : new Date();
        } else if (draftRaw && draftElapsedSec > 0) {
          startTime = new Date(Date.now() - draftElapsedSec * 1000);
        } else {
          startTime = new Date();
        }
        setStartedAt(startTime);
        setAnswers(draftAnswers);
        setFlagged(new Set(draftFlagged));
        setCurrentIndex(Math.min(draftCurrentIndex, t.questions.length - 1));
        timeSpentRef.current = draftTimeSpent;
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Không tải được đề thi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testId, userId]);

  const questions = test?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Compute global TOEIC question numbers (1-200) for every question in this test.
  // Works for both Full Test (sequential 1-200) and Practice Part X (offset by part start).
  const globalNumbers = useMemo(() => computeGlobalNumbers(questions), [questions]);
  const currentGlobalNumber = globalNumbers[currentIndex];

  // Hiển thị block hướng dẫn Part chỉ ở câu đầu tiên của Part đó trong test.
  // Full Test: hiện 7 lần (đầu Part 1, 2, 3, 4, 5, 6, 7). Practice: hiện 1 lần.
  const isFirstOfPart =
    currentIndex === 0 || questions[currentIndex - 1]?.part !== currentQuestion?.part;
  const totalCount = questions.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => v != null).length,
    [answers],
  );

  // 2. Track time on each question
  useEffect(() => {
    lastTickRef.current = Date.now();
    return () => {
      if (currentQuestion?._id) {
        const elapsed = Math.round((Date.now() - lastTickRef.current) / 1000);
        timeSpentRef.current[currentQuestion._id] =
          (timeSpentRef.current[currentQuestion._id] || 0) + elapsed;
      }
    };
  }, [currentIndex, currentQuestion?._id]);

  // 3. Auto-save draft to localStorage every 10s
  useEffect(() => {
    if (!test || !startedAt || !userId) return;
    const saveDraft = () => {
      // elapsedSec = thời lượng tích lũy hiện tại (NOW - startedAt).
      // Khi user quay lại sau, mount sẽ reconstruct startedAt từ giá trị này
      // → đảm bảo Timer (Practice mode) pause-on-leave behavior.
      const elapsedSec = Math.max(
        0,
        Math.floor((Date.now() - startedAt.getTime()) / 1000),
      );
      const draft = {
        startedAt: startedAt.toISOString(),
        elapsedSec,
        answers,
        flagged: [...flagged],
        currentIndex,
        timeSpent: timeSpentRef.current,
      };
      localStorage.setItem(draftKey(userId, testId), JSON.stringify(draft));
      setLastSavedAt(new Date());
    };
    saveDraft(); // save immediately on any change
    const id = setInterval(saveDraft, 10000);
    // Save 1 lần nữa khi unmount (user navigate đi) để giảm độ trễ giữa 2 lần
    // autosave 10s. Tránh trường hợp user làm thêm 5s rồi back ra → chỉ mất 5s.
    return () => {
      clearInterval(id);
      saveDraft();
    };
  }, [test, startedAt, answers, flagged, currentIndex, testId, userId]);

  // 4. Handlers — keyed by questionId so group views (Part 3/4/6/7) can answer
  // any question in the visible group, not just the "current" one.
  const handleSelect = useCallback((questionId, key) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }, []);

  const handleToggleFlag = useCallback((questionId) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  // Group questions sharing the same passage or audio file:
  //   - Part 6/7 + Part 3/4 with graphic → grouped by image passage range
  //   - Part 3/4 without graphic         → grouped by audio range (E26-TXX-{start}-{end}.mp3)
  //   - Part 1/2/5 (single audio/image)  → group is just [currentQuestion]
  const groupQuestions = useMemo(() => {
    if (!currentQuestion) return [];
    const passage = parsePassageRange(currentQuestion.content?.imageUrl);
    if (passage) {
      return questions.filter((q) => {
        const p = parsePassageRange(q.content?.imageUrl);
        return (
          p &&
          p.type === passage.type &&
          p.start === passage.start &&
          p.end === passage.end
        );
      });
    }
    const audio = parseAudioRange(currentQuestion.content?.audioUrl);
    if (audio) {
      return questions.filter((q) => {
        const a = parseAudioRange(q.content?.audioUrl);
        return a && a.start === audio.start && a.end === audio.end;
      });
    }
    return [currentQuestion];
  }, [questions, currentQuestion]);

  const groupGlobalNumbers = useMemo(
    () => groupQuestions.map((q) => globalNumbers[questions.indexOf(q)]),
    [groupQuestions, globalNumbers, questions],
  );

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(totalCount - 1, i + 1));
  const handleJump = (idx) => setCurrentIndex(idx);

  // 5. Submit
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !test || !startedAt) return;
    setSubmitError('');
    setIsSubmitting(true);

    // Flush current question's time tracking
    if (currentQuestion?._id) {
      const elapsed = Math.round((Date.now() - lastTickRef.current) / 1000);
      timeSpentRef.current[currentQuestion._id] =
        (timeSpentRef.current[currentQuestion._id] || 0) + elapsed;
    }

    const payload = {
      testId,
      startedAt: startedAt.toISOString(),
      answers: questions.map((q) => ({
        questionId: q._id,
        selected: answers[q._id] ?? null,
        timeSpentSec: timeSpentRef.current[q._id] || 0,
      })),
    };

    try {
      const res = await resultService.submit(payload);
      // Clear draft
      localStorage.removeItem(draftKey(userId, testId));
      // Navigate to result detail
      navigate(`/results/${res.data.result._id}`);
    } catch (err) {
      // Giữ user trên trang exam + hiện lỗi trong SubmitModal để retry,
      // không setError (gây replace trang) — bài làm vẫn còn nguyên trong state + draft.
      const msg = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')
        ? 'Mạng hoặc AI phân tích đang chậm. Bài làm của bạn được giữ — thử bấm "Nộp lại".'
        : err?.message || 'Nộp bài thất bại. Vui lòng thử lại.';
      setSubmitError(msg);
      setIsSubmitting(false);
      // Giữ SubmitModal mở để user thấy error + retry
    }
  }, [isSubmitting, test, startedAt, currentQuestion, testId, questions, answers, userId, navigate]);

  // Auto-submit when timer expires
  const handleExpire = useCallback(() => {
    if (!isSubmitting) {
      setSubmitOpen(false);
      handleSubmit();
    }
  }, [handleSubmit, isSubmitting]);

  // Cảnh báo khi user đóng tab / reload / navigate ra khỏi domain trong lúc làm bài.
  // Browser sẽ hiện native confirm dialog ("Reload site? Changes you made may not be saved").
  // KHÔNG thể custom UI cho beforeunload — browser ép native dialog vì lý do bảo mật.
  useEffect(() => {
    if (!test || isSubmitting) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome cần dòng này để hiện dialog
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [test, isSubmitting]);

  // Keyboard shortcuts: A/B/C/D + arrow keys.
  // A/B/C/D answers the focused question (currentQuestion); for group views user can
  // still click on any question block directly.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const validKeys = currentQuestion?.options.map((o) => o.key) || [];
        if (validKeys.includes(key)) handleSelect(currentQuestion._id, key);
      } else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSelect, currentQuestion]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !test || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card max-w-md">
          <h2 className="font-heading font-bold text-lg mb-2">Lỗi tải đề thi</h2>
          <p className="text-slate-600 mb-4">{error || 'Không có dữ liệu'}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="px-6 lg:px-10 xl:px-14 py-3 grid grid-cols-3 items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              {test.type === 'full' ? 'Full Test' : 'Luyện tập'}
            </p>
            <h1 className="font-heading font-semibold truncate">{test.title}</h1>
          </div>

          <div className="text-center">
            <p className="font-heading font-semibold text-slate-900">
              {currentQuestion.part <= 4 ? 'Listening' : 'Reading'}: Part {currentQuestion.part}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 justify-end">
            {lastSavedAt && (
              <span className="hidden xl:flex items-center gap-1 text-xs text-slate-500">
                <Save className="w-3 h-3" />
                Lưu lúc {lastSavedAt.toLocaleTimeString('vi-VN')}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-sm font-mono font-semibold text-slate-700">
              {answeredCount}/{totalCount}
            </span>
            <Timer
              durationSec={test.durationMinutes * 60}
              startedAt={startedAt}
              onExpire={
                test.type === 'full' && !isPracticeMode
                  ? handleExpire
                  : undefined
              }
              mode={
                test.type === 'full' && !isPracticeMode ? 'countdown' : 'elapsed'
              }
            />
            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
              className="btn bg-tertiary-500 text-white hover:bg-tertiary-600 px-4 py-2"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </header>

      {/* Body: 3-column card grid + separated nav bar — fits viewport */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden px-6 lg:px-10 xl:px-14 py-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] lg:grid-rows-[minmax(0,1fr)] gap-6 items-stretch">
          <QuestionMedia
            question={currentQuestion}
            globalNumber={currentGlobalNumber}
            isFirstOfPart={isFirstOfPart}
          />

          <QuestionOptions
            questions={groupQuestions}
            globalNumbers={groupGlobalNumbers}
            answers={answers}
            flagged={flagged}
            onSelect={handleSelect}
            onToggleFlag={handleToggleFlag}
          />

          <AnswerSheet
            questions={questions}
            globalNumbers={globalNumbers}
            answers={answers}
            flagged={flagged}
            currentIndex={currentIndex}
            onJump={handleJump}
          />
        </div>

        {/* Bottom nav bar — separated, centered */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-center gap-6 sm:gap-10 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-ghost flex items-center"
          >
            <ArrowLeft className="w-4 h-4" /> Câu trước
          </button>

          <div className="text-xs text-slate-500 hidden sm:block">
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">A</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">B</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">C</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">D</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">→</kbd>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === totalCount - 1}
            className="btn-primary"
          >
            Câu tiếp <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SubmitModal
        open={submitOpen}
        onCancel={() => {
          if (isSubmitting) return;
          setSubmitOpen(false);
          setSubmitError('');
        }}
        onConfirm={handleSubmit}
        answeredCount={answeredCount}
        totalCount={totalCount}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
