import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  Lightbulb,
  RotateCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resultService } from "@/services/resultService";
import { aiService } from "@/services/aiService";
import { useAuthStore } from "@/store/authStore";
import { formatDuration } from "@/utils/formatTime";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import ScoreCard from "@/components/result/ScoreCard";

const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || "";
const toMediaUrl = (url) =>
  url && url.startsWith("/") ? `${MEDIA_BASE}${url}` : url;

const PART_NAMES = {
  1: "Part 1 — Mô tả tranh",
  2: "Part 2 — Hỏi đáp",
  3: "Part 3 — Đoạn hội thoại",
  4: "Part 4 — Bài nói ngắn",
  5: "Part 5 — Hoàn thành câu",
  6: "Part 6 — Hoàn thành đoạn",
  7: "Part 7 — Đọc hiểu",
};

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resultService
      .getById(id)
      .then((res) => {
        if (!cancelled) setResult(res.data.result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không tải được kết quả");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !result) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-8 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading font-bold mb-2">Lỗi</h2>
              <p className="text-slate-600">{error || "Không có dữ liệu"}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isFullTest = result.testType === "full";
  const test = result.testId;
  const submittedDate = new Date(result.submittedAt).toLocaleString("vi-VN");

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 pt-6 pb-0 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="mb-3 shrink-0">
          <Link
            to={ROUTES.RESULTS}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-heading font-bold">
              {test?.title || "Kết quả bài làm"}
            </h1>
            <p className="text-sm text-slate-600">
              Nộp lúc {submittedDate} • Thời gian làm:{" "}
              {formatDuration(result.durationSec)}
            </p>
          </div>
          <Link
            to={
              test?.type === "full"
                ? `/full-test/${test._id}`
                : `/practice/${test._id}`
            }
            className="btn-secondary text-sm"
          >
            <RotateCw className="w-4 h-4" /> Làm lại đề này
          </Link>
        </div>

        <Tabs
          defaultValue="overview"
          className="mt-2 flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <TabsList className="shrink-0 self-start">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Phân tích với AI
            </TabsTrigger>
            <TabsTrigger value="review">
              Đáp án chi tiết ({result.totalQuestions})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="mt-6 flex-1 min-h-0 overflow-auto"
          >
            <OverviewTab result={result} />
          </TabsContent>

          <TabsContent value="ai" className="mt-6 flex-1 min-h-0 overflow-auto">
            <AIAnalysisPanel
              resultId={result._id}
              testType={result.testType}
              analysis={result.aiAnalysis}
              onAnalysisUpdate={(a) =>
                setResult((r) => ({ ...r, aiAnalysis: a }))
              }
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6 flex-1 min-h-0">
            <ReviewTab result={result} isFullTest={isFullTest} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function OverviewTab({ result }) {
  const isFullTest = result.testType === "full";

  const parts = Object.entries(result.partBreakdown || {})
    .filter(([, v]) => v.total > 0)
    .map(([key, v]) => ({
      key,
      part: Number(key.replace("part", "")),
      ...v,
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.part - b.part);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6 h-full items-stretch">
      <div className="h-full">
        <ScoreCard result={result} isFullTest={isFullTest} compact />
      </div>

      <Card className="h-full overflow-hidden flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary-500" />
            Phân tích theo Part
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-4">
            {parts.map((p) => (
              <div key={p.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-700">
                    {PART_NAMES[p.part] || `Part ${p.part}`}
                  </span>
                  <span className="font-mono font-semibold">
                    {p.correct}/{p.total} • {p.accuracy}%
                  </span>
                </div>
                <Progress
                  value={p.accuracy}
                  className={cn(
                    "h-2",
                    p.accuracy >= 80 && "[&>div]:bg-secondary-500",
                    p.accuracy >= 60 &&
                      p.accuracy < 80 &&
                      "[&>div]:bg-yellow-400",
                    p.accuracy < 60 && "[&>div]:bg-tertiary-500",
                  )}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-full overflow-hidden flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="text-base">Thống kê chung</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Tổng số câu</span>
              <strong>{result.totalQuestions}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Số câu đúng</span>
              <strong className="text-secondary-600">
                {result.correctCount}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Số câu sai / bỏ qua</span>
              <strong className="text-tertiary-600">
                {result.totalQuestions - result.correctCount}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tỷ lệ chính xác</span>
              <strong>{result.accuracy}%</strong>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="text-slate-600">Thời gian làm bài</span>
              <strong>{formatDuration(result.durationSec)}</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const PRIORITY_META = {
  high: {
    label: "Ưu tiên cao",
    className: "bg-tertiary-100 text-tertiary-700 border-tertiary-200",
  },
  medium: {
    label: "Ưu tiên vừa",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  low: {
    label: "Ưu tiên thấp",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

function AIAnalysisPanel({ resultId, testType, analysis, onAnalysisUpdate }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleAnalyze = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await aiService.analyze(resultId);
      onAnalysisUpdate(res.data.analysis);
    } catch (e) {
      setErr(
        e?.message ||
          "Không thể sinh phân tích AI. Có thể bạn đã chạm giới hạn 5 lần/giờ — thử lại sau.",
      );
    } finally {
      setBusy(false);
    }
  };

  const errorModal = <AIErrorModal err={err} onClose={() => setErr("")} />;

  // Chưa có analysis → empty state với CTA
  if (!analysis) {
    return (
      <>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
              Nhận phân tích cá nhân hóa từ AI
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
              AI sẽ chỉ ra điểm mạnh, điểm yếu của bạn dựa trên bài làm này và
              gợi ý hướng luyện tiếp theo. Quá trình mất khoảng 10-20 giây.
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Phân tích với AI
                </>
              )}
            </button>
            <p className="text-xs text-slate-400 mt-3">
              Giới hạn 5 lần mỗi giờ để tránh quá tải.
            </p>
          </CardContent>
        </Card>
        {errorModal}
      </>
    );
  }

  // Đã có analysis → render + nút "Phân tích lại"
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-500">
          {analysis.isFallback
            ? "Phân tích nội bộ (chưa qua OpenAI)"
            : `Phân tích bởi ${analysis.model}`}
          {analysis.createdAt &&
            ` • ${new Date(analysis.createdAt).toLocaleString("vi-VN")}`}
        </p>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={busy}
          className="btn-secondary text-sm"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích…
            </>
          ) : (
            <>
              <RotateCw className="w-4 h-4" /> Phân tích lại
            </>
          )}
        </button>
      </div>
      <AIAnalysisTab analysis={analysis} testType={testType} />
      {errorModal}
    </div>
  );
}

/**
 * Modal hiển thị lỗi khi gọi AI thất bại (rate limit, OpenAI down, network, ...).
 * Phân biệt rate limit (429) để icon + title khác cho UX rõ ràng.
 */
function AIErrorModal({ err, onClose }) {
  // Detect rate limit qua keyword đặc trưng trong message từ BE
  const isRateLimit =
    err && (err.includes("giới hạn") || err.includes("nhiều yêu cầu"));

  const title = isRateLimit
    ? "Đã đạt giới hạn phân tích AI"
    : "Không thể phân tích AI";
  const Icon = isRateLimit ? AlertTriangle : XCircle;
  const iconBg = isRateLimit
    ? "bg-yellow-100 text-yellow-700"
    : "bg-tertiary-100 text-tertiary-700";

  return (
    <Dialog open={!!err} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div
            className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-3`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2 text-slate-600 leading-relaxed">
            {err}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-sm"
          >
            Đã hiểu
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AIAnalysisTab({ analysis, testType }) {
  const targetScore = useAuthStore((s) => s.user?.targetScore) || 700;
  const {
    strengths,
    weaknesses,
    recommendations,
    estimatedTargetWeeks,
    isFallback,
  } = analysis;

  // Chỉ hiện card lộ trình cho Full Test — Practice 1 Part không đủ data
  // để ước lượng thời gian đạt mục tiêu tổng. BE prompt cũng đã set 0 cho
  // Practice nhưng FE guard thêm phòng AI không obey.
  const showRoadmap = testType === "full" && estimatedTargetWeeks > 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-900">
          Phân tích đang dùng thuật toán nội bộ (chưa có OpenAI). Khi key sẵn
          sàng, phân tích sẽ chi tiết hơn dựa trên LLM.
        </div>
      )}

      {showRoadmap && (
        <Card className="bg-gradient-to-br from-secondary-50 to-primary-50 border-secondary-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Target className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">
                Lộ trình đề xuất tới mục tiêu {targetScore}+
              </p>
              <p className="font-mono text-2xl font-bold text-slate-900">
                {estimatedTargetWeeks} tuần
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Với cường độ luyện 3-5 buổi/tuần, kết hợp Practice + Full Test.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
              Điểm mạnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-tertiary-500" />
              Cần cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-tertiary-500 flex-shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Khuyến nghị luyện tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const meta =
                  PRIORITY_META[rec.priority] || PRIORITY_META.medium;
                return (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h4 className="font-semibold text-slate-900">
                        {rec.topic}
                      </h4>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium",
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {rec.action}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Part 1-2: audio + (image for P1) + options-only-letter + blue explanation box
// Part 3-7: text + options-with-text + explanation
const HIDE_OPTION_TEXT_PARTS = new Set([1, 2]);

function ReviewTab({ result, isFullTest }) {
  const answers = (result.answers || []).filter((a) => a.question);
  const middleScrollRef = useRef(null);

  // Smooth scroll câu được click trong navigator vào view CHỈ trong card giữa.
  // Dùng manual scrollTo trên container thay vì scrollIntoView — vì scrollIntoView
  // sẽ scroll mọi ancestor scrollable (kể cả AppLayout main) làm trồi page lên.
  const handleJump = (idx) => {
    const ans = answers[idx];
    const container = middleScrollRef.current;
    if (!ans || !container) return;
    const el = container.querySelector(`#review-q-${ans.questionId}`);
    if (!el) return;
    const top = el.offsetTop - container.offsetTop;
    container.scrollTo({ top, behavior: "smooth" });
  };

  // Pre-compute per-part totals + index-in-part for header rendering
  const partTotals = useMemo(() => {
    const map = new Map();
    answers.forEach((a) => {
      const p = a.question.part;
      map.set(p, (map.get(p) || 0) + 1);
    });
    return map;
  }, [answers]);

  const indexInPart = useMemo(() => {
    const map = new Map();
    const counters = new Map();
    answers.forEach((a) => {
      const p = a.question.part;
      const c = (counters.get(p) || 0) + 1;
      counters.set(p, c);
      map.set(a.questionId, c);
    });
    return map;
  }, [answers]);

  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-600">
          Không có câu trả lời nào để xem lại.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)] gap-6 items-stretch h-full overflow-hidden">
      <ReviewStatCard
        result={result}
        isFullTest={isFullTest}
        answers={answers}
      />

      {/* MIDDLE: scrollable list of all questions — outer keeps rounded corners, inner scrolls */}
      <div className="bg-white rounded-2xl border border-slate-200 h-full overflow-hidden">
        <div ref={middleScrollRef} className="h-full overflow-y-auto p-6 md:p-8">
          <div className="space-y-8">
            {answers.map((ans) => (
              <ReviewQuestion
                key={ans.questionId}
                ans={ans}
                totalInPart={partTotals.get(ans.question.part) || 0}
                indexInPart={indexInPart.get(ans.questionId) || 0}
              />
            ))}
          </div>
        </div>
      </div>

      <ReviewNavigator answers={answers} onJump={handleJump} />
    </div>
  );
}

function ReviewStatCard({ result, isFullTest, answers }) {
  // Breakdown per part
  const partBreakdown = useMemo(() => {
    const map = new Map();
    answers.forEach((a) => {
      const p = a.question.part;
      const prev = map.get(p) || { correct: 0, total: 0 };
      map.set(p, {
        correct: prev.correct + (a.isCorrect ? 1 : 0),
        total: prev.total + 1,
      });
    });
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [answers]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full overflow-y-auto flex flex-col gap-5">
      <ScoreCard result={result} isFullTest={isFullTest} compact />

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-sm">
        {partBreakdown.map(([part, { correct, total }]) => (
          <div key={part} className="flex items-center justify-between">
            <span className="text-slate-600">
              {part <= 4 ? "Listening" : "Reading"} Part {part}
            </span>
            <strong className="font-mono">
              {correct}/{total}
            </strong>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Tỷ lệ chính xác</span>
          <strong className="font-mono">{result.accuracy}%</strong>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3">
          <span className="text-slate-600">Thời gian làm bài</span>
          <strong className="font-mono">
            {formatDuration(result.durationSec)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function ReviewQuestion({ ans, totalInPart, indexInPart }) {
  const q = ans.question;
  const part = q.part;
  const hideOptionText = HIDE_OPTION_TEXT_PARTS.has(part);
  const hasAudio = !!q.content?.audioUrl;
  const hasImage = !!q.content?.imageUrl;
  const hasText = !!q.content?.text;
  const userChose = ans.selected;
  const correct = q.correctAnswer;

  return (
    <article id={`review-q-${ans.questionId}`} className="scroll-mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-semibold text-slate-900 text-lg">
          Part {part}{" "}
          <span className="text-primary-600 font-mono">
            [{indexInPart}/{totalInPart}]
          </span>
        </h4>
        {ans.isCorrect ? (
          <Badge className="bg-secondary-500 text-white hover:bg-secondary-600">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đúng
          </Badge>
        ) : userChose ? (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Sai
          </Badge>
        ) : (
          <Badge variant="muted">Bỏ qua</Badge>
        )}
      </div>

      {hasAudio && (
        <audio
          controls
          src={toMediaUrl(q.content.audioUrl)}
          className="w-full mb-4"
          preload="none"
        />
      )}

      {hasImage && (
        <div className="mb-4 rounded-lg overflow-hidden bg-slate-100 max-w-2xl">
          {q.content.imageUrl.split(";").map((url, i) => (
            <img
              key={i}
              src={toMediaUrl(url.trim())}
              alt={`Passage ${i + 1}`}
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
        </div>
      )}

      {hasText && !hideOptionText && (
        <p className="text-slate-900 mb-3 whitespace-pre-wrap leading-relaxed">
          {q.content.text}
        </p>
      )}

      <div className="space-y-2 mb-4">
        {q.options.map((opt) => {
          const isUser = opt.key === userChose;
          const isAnswerKey = opt.key === correct;
          return (
            <div
              key={opt.key}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                isAnswerKey && "border-secondary-300 bg-secondary-50",
                !isAnswerKey && isUser && "border-red-300 bg-red-50",
                !isAnswerKey && !isUser && "border-slate-200",
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold flex-shrink-0",
                  isAnswerKey &&
                    "border-secondary-500 bg-secondary-500 text-white",
                  !isAnswerKey &&
                    isUser &&
                    "border-red-500 bg-red-500 text-white",
                  !isAnswerKey && !isUser && "border-slate-300 text-slate-500",
                )}
              >
                {isAnswerKey || isUser ? "●" : ""}
              </span>
              <span className="flex-1 text-slate-900">
                {hideOptionText ? (
                  `(${opt.key})`
                ) : (
                  <>
                    <span className="font-medium mr-1">({opt.key})</span>
                    {opt.text}
                  </>
                )}
              </span>
              {isAnswerKey && (
                <Badge className="bg-secondary-500 text-white hover:bg-secondary-600 text-xs">
                  Đáp án đúng
                </Badge>
              )}
              {isUser && !isAnswerKey && (
                <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs">
                  Bạn chọn
                </Badge>
              )}
            </div>
          );
        })}
        {userChose == null && (
          <p className="text-xs text-slate-500 italic">
            Bạn không trả lời câu này.
          </p>
        )}
      </div>

      <div className="rounded-lg bg-primary-50 border border-primary-100 p-4 text-sm">
        <p className="font-semibold text-primary-700 mb-1.5">
          Đáp án chính xác: ({correct})
        </p>
        <p className="font-semibold text-slate-800 mb-2">Câu {indexInPart}:</p>

        {/* Liệt kê 4 options English với option đúng được in đậm */}
        <ul className="space-y-1 mb-3">
          {q.options.map((opt) => (
            <li
              key={opt.key}
              className={cn(
                "text-slate-700",
                opt.key === correct && "font-bold text-slate-900",
              )}
            >
              ({opt.key}) {opt.text}
            </li>
          ))}
        </ul>

        {q.explanation && (
          <div className="border-t border-primary-100 pt-3 mt-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {q.explanation}
              </p>
            </div>
          </div>
        )}

        {q.vocab && q.vocab.length > 0 && (
          <div className="border-t border-primary-100 pt-3 mt-2">
            <p className="text-xs font-semibold text-primary-700 mb-1.5">
              Từ vựng cần nhớ:
            </p>
            <ul className="text-xs text-slate-700 space-y-0.5">
              {q.vocab.map((v, i) => (
                <li key={i}>
                  <strong>{v.word}</strong>: {v.meaning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function ReviewNavigator({ answers, onJump }) {
  const grouped = useMemo(() => {
    const map = new Map();
    answers.forEach((a, idx) => {
      const p = a.question.part;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push({ ans: a, idx });
    });
    return map;
  }, [answers]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col">
      <h3 className="font-heading font-semibold text-slate-900 mb-3">
        Phiếu kết quả
      </h3>

      <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
          Đúng
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Sai
        </li>
        <li className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Bỏ qua
        </li>
      </ul>

      <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
        {[...grouped.entries()].map(([part, items]) => (
          <div key={part}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Part {part}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {items.map(({ ans, idx }) => {
                let cls =
                  "h-9 text-xs font-semibold rounded-md border transition-colors ";
                if (ans.isCorrect) {
                  cls +=
                    "bg-secondary-50 border-secondary-300 text-secondary-700 hover:bg-secondary-100";
                } else if (ans.selected) {
                  cls +=
                    "bg-red-50 border-red-300 text-red-700 hover:bg-red-100";
                } else {
                  cls +=
                    "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100";
                }
                return (
                  <button
                    key={ans.questionId}
                    type="button"
                    onClick={() => onJump(idx)}
                    className={cls}
                  >
                    {idx + 1}
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
