import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';
import Timer from '../components/exam/Timer.jsx';
import AnswerSheet from '../components/exam/AnswerSheet.jsx';
import QuestionCard from '../components/exam/QuestionCard.jsx';
import SubmitModal from '../components/exam/SubmitModal.jsx';
import { testService } from '../services/testService.js';
import { resultService } from '../services/resultService.js';
import { useAuthStore } from '../store/authStore.js';
import { computeGlobalNumbers } from '../constants/toeic.js';

const draftKey = (userId, testId) => `exam-draft:${userId}:${testId}`;

export default function PracticeDetail() {
  const { testId } = useParams();
  const navigate = useNavigate();
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

        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            draftStartedAt = draft.startedAt;
            draftAnswers = draft.answers || {};
            draftFlagged = draft.flagged || [];
            draftCurrentIndex = draft.currentIndex || 0;
            draftTimeSpent = draft.timeSpent || {};
          } catch {
            // ignore corrupt draft
          }
        }

        const startTime = draftStartedAt ? new Date(draftStartedAt) : new Date();
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
      const draft = {
        startedAt: startedAt.toISOString(),
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
    return () => clearInterval(id);
  }, [test, startedAt, answers, flagged, currentIndex, testId, userId]);

  // 4. Handlers
  const handleSelect = useCallback(
    (key) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion._id]: key }));
    },
    [currentQuestion],
  );

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion._id)) next.delete(currentQuestion._id);
      else next.add(currentQuestion._id);
      return next;
    });
  }, [currentQuestion]);

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

  // Keyboard shortcuts: A/B/C/D + arrow keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const validKeys = currentQuestion?.options.map((o) => o.key) || [];
        if (validKeys.includes(key)) handleSelect(key);
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
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{test.type === 'full' ? 'Full Test' : 'Luyện tập'}</p>
            <h1 className="font-heading font-semibold truncate">{test.title}</h1>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {lastSavedAt && (
              <span className="hidden md:flex items-center gap-1 text-xs text-slate-500">
                <Save className="w-3 h-3" />
                Lưu lúc {lastSavedAt.toLocaleTimeString('vi-VN')}
              </span>
            )}
            <Timer
              durationSec={test.durationMinutes * 60}
              startedAt={startedAt}
              onExpire={test.type === 'full' ? handleExpire : undefined}
              mode={test.type === 'full' ? 'countdown' : 'elapsed'}
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

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <QuestionCard
            question={currentQuestion}
            globalNumber={currentGlobalNumber}
            isFirstOfPart={isFirstOfPart}
            selected={answers[currentQuestion._id] ?? null}
            isFlagged={flagged.has(currentQuestion._id)}
            onSelect={handleSelect}
            onToggleFlag={handleToggleFlag}
          />

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn-ghost flex items-center"
            >
              <ArrowLeft className="w-4 h-4" /> Câu trước
            </button>

            <div className="text-xs text-slate-500 hidden sm:block">
              Phím tắt: <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">A</kbd>{' '}
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

        <AnswerSheet
          questions={questions}
          globalNumbers={globalNumbers}
          answers={answers}
          flagged={flagged}
          currentIndex={currentIndex}
          onJump={handleJump}
        />
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
