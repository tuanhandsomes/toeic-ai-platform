import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  BookOpen,
  Headphones,
  Lightbulb,
  RotateCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Flag,
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
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-3">
          <Link
            to={ROUTES.RESULTS}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại lịch sử
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
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

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Phân tích với AI
            </TabsTrigger>
            <TabsTrigger value="review">
              Đáp án chi tiết ({result.totalQuestions})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab result={result} />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AIAnalysisPanel
              resultId={result._id}
              testType={result.testType}
              analysis={result.aiAnalysis}
              onAnalysisUpdate={(a) =>
                setResult((r) => ({ ...r, aiAnalysis: a }))
              }
            />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            <ReviewTab result={result} isFullTest={isFullTest} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function ScoreBanner({ result, isFullTest }) {
  if (isFullTest) {
    return (
      <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-primary-100 text-sm uppercase tracking-wider mb-1">
                Tổng điểm TOEIC
              </p>
              <p className="font-mono text-6xl font-bold">
                {result.scoreTotal}{" "}
                <span className="text-2xl text-primary-200">/ 990</span>
              </p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-100">Listening</p>
                  <p className="font-mono text-2xl font-bold">
                    {result.scoreListening}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-100">Reading</p>
                  <p className="font-mono text-2xl font-bold">
                    {result.scoreReading}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary-500">
      <CardContent className="p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">
              Kết quả luyện tập
            </p>
            <p className="font-mono text-5xl font-bold text-slate-900">
              {result.correctCount}
              <span className="text-2xl text-slate-400">
                {" "}
                / {result.totalQuestions}
              </span>
            </p>
            <p className="text-sm text-slate-600 mt-1">Số câu đúng</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-5xl font-bold text-secondary-600">
              {result.accuracy}%
            </p>
            <p className="text-sm text-slate-600 mt-1">Tỷ lệ chính xác</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ result }) {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary-500" />
            Phân tích theo Part
          </CardTitle>
        </CardHeader>
        <CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thống kê chung</CardTitle>
        </CardHeader>
        <CardContent>
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

  const errorModal = (
    <AIErrorModal err={err} onClose={() => setErr("")} />
  );

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
    err &&
    (err.includes("giới hạn") || err.includes("nhiều yêu cầu"));

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

const PART_TITLE = {
  1: "Part 1",
  2: "Part 2",
  3: "Part 3",
  4: "Part 4",
  5: "Part 5",
  6: "Part 6",
  7: "Part 7",
};

// Part 1-2: audio + (image for P1) + options-only-letter + blue explanation box
// Part 3-7: text + options-with-text + explanation
const HIDE_OPTION_TEXT_PARTS = new Set([1, 2]);

function ReviewTab({ result, isFullTest }) {
  const answers = (result.answers || []).filter((a) => a.question);

  const parts = useMemo(() => {
    const set = new Set(answers.map((a) => a.question.part));
    return [...set].sort((a, b) => a - b);
  }, [answers]);

  const [viewMode, setViewMode] = useState("part"); // 'part' | 'all'
  const [activePart, setActivePart] = useState(parts[0] || 1);

  // Index global theo thứ tự câu hỏi để Navigator highlight đúng
  const globalIndex = useMemo(() => {
    const map = new Map();
    answers.forEach((a, idx) => map.set(a.questionId, idx));
    return map;
  }, [answers]);

  const displayedAnswers = useMemo(() => {
    if (viewMode === "all") return answers;
    return answers.filter((a) => a.question.part === activePart);
  }, [answers, viewMode, activePart]);

  const handleJump = (questionId) => {
    const el = document.getElementById(`review-q-${questionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_240px] gap-4">
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <ReviewSidebar result={result} isFullTest={isFullTest} />
        </div>
      </div>

      <div className="min-w-0">
        <PartFilterBar
          parts={parts}
          activePart={activePart}
          onSelectPart={setActivePart}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="space-y-6 mt-4">
          {viewMode === "all" ? (
            parts.map((p) => (
              <ReviewPartSection
                key={p}
                part={p}
                answers={answers.filter((a) => a.question.part === p)}
                globalIndex={globalIndex}
              />
            ))
          ) : (
            <ReviewPartSection
              part={activePart}
              answers={displayedAnswers}
              globalIndex={globalIndex}
            />
          )}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-4">
          <ReviewNavigator
            answers={answers}
            activePart={viewMode === "all" ? null : activePart}
            onJump={handleJump}
          />
        </div>
      </div>
    </div>
  );
}

function ReviewSidebar({ result, isFullTest }) {
  const scoreLabel = isFullTest ? "Điểm TOEIC" : "Số câu đúng";
  const scoreValue = isFullTest ? result.scoreTotal : result.correctCount;
  const scoreTotal = isFullTest ? 990 : result.totalQuestions;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-card shadow-card p-5 text-center">
        <Flag
          className="w-7 h-7 text-yellow-500 mx-auto mb-1.5"
          fill="currentColor"
        />
        <p className="text-xs text-slate-500 uppercase tracking-wider">Điểm</p>
        <p className="font-mono text-4xl font-bold text-slate-900 mt-1">
          {scoreValue}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">/ {scoreTotal}</p>
      </div>

      <div className="bg-slate-50 rounded-card border border-slate-200 p-4 text-sm">
        {isFullTest ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Listening</span>
              <strong className="font-mono">{result.scoreListening}/495</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Reading</span>
              <strong className="font-mono">{result.scoreReading}/495</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Trả lời đúng</span>
              <strong className="font-mono">
                {result.correctCount}/{result.totalQuestions}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tỷ lệ</span>
              <strong className="font-mono">{result.accuracy}%</strong>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-slate-600 text-xs uppercase tracking-wider">
              {scoreLabel}
            </p>
            <p className="text-center font-mono text-2xl font-bold">
              {result.correctCount}/{result.totalQuestions}
            </p>
            <div className="border-t border-slate-200 pt-2 flex justify-between">
              <span className="text-slate-600">Tỷ lệ</span>
              <strong className="font-mono">{result.accuracy}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Thời gian</span>
              <strong className="font-mono">
                {formatDuration(result.durationSec)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PartFilterBar({
  parts,
  activePart,
  onSelectPart,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="bg-white rounded-card shadow-card p-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {viewMode === "part" &&
          parts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onSelectPart(p)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-md transition-colors",
                activePart === p
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Part {p}
            </button>
          ))}
        {viewMode === "all" && (
          <span className="text-xs text-slate-500 font-medium px-2">
            Hiển thị tất cả các Part
          </span>
        )}
      </div>

      <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => onViewModeChange("part")}
          className={cn(
            "px-3 py-1.5 font-medium transition-colors",
            viewMode === "part"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Xem một phần
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("all")}
          className={cn(
            "px-3 py-1.5 font-medium border-l border-slate-200 transition-colors",
            viewMode === "all"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          Xem toàn bộ
        </button>
      </div>
    </div>
  );
}

function ReviewPartSection({ part, answers, globalIndex }) {
  if (answers.length === 0) return null;
  const correctInPart = answers.filter((a) => a.isCorrect).length;

  return (
    <section>
      <div className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-lg px-4 py-2.5 mb-4">
        <h3 className="font-heading font-bold text-primary-700">
          {PART_TITLE[part]}
        </h3>
        <span className="text-xs font-mono text-primary-700">
          {correctInPart}/{answers.length} câu đúng
        </span>
      </div>

      <div className="space-y-5">
        {answers.map((ans) => {
          const idx = globalIndex.get(ans.questionId) ?? 0;
          return <ReviewQuestion key={ans.questionId} ans={ans} index={idx} />;
        })}
      </div>
    </section>
  );
}

function ReviewQuestion({ ans, index }) {
  const q = ans.question;
  const part = q.part;
  const hideOptionText = HIDE_OPTION_TEXT_PARTS.has(part);
  const hasAudio = !!q.content?.audioUrl;
  const hasImage = !!q.content?.imageUrl;
  const hasText = !!q.content?.text;
  const userChose = ans.selected;
  const correct = q.correctAnswer;

  return (
    <article
      id={`review-q-${ans.questionId}`}
      className="bg-white rounded-card shadow-card p-5 md:p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-900">
          Question {index + 1}
          {ans.isCorrect ? (
            <span className="ml-2 inline-flex items-center gap-1 text-secondary-600 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
            </span>
          ) : (
            <span className="ml-2 inline-flex items-center gap-1 text-tertiary-600 text-xs font-medium">
              <XCircle className="w-3.5 h-3.5" /> Sai
            </span>
          )}
        </h4>
        <Badge variant="muted">Part {part}</Badge>
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
                !isAnswerKey && isUser && "border-tertiary-300 bg-tertiary-50",
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
                    "border-tertiary-500 bg-tertiary-500 text-white",
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
                <Badge className="bg-tertiary-500 text-white hover:bg-tertiary-600 text-xs">
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
        <p className="font-semibold text-slate-800 mb-2">Number {index + 1}:</p>

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

function ReviewNavigator({ answers, activePart, onJump }) {
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
    <div className="bg-white rounded-card shadow-card p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="space-y-4">
        {[...grouped.entries()].map(([part, items]) => {
          const dimmed = activePart != null && activePart !== part;
          return (
            <div key={part} className={cn(dimmed && "opacity-40")}>
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Part {part}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {items.map(({ ans, idx }) => (
                  <button
                    key={ans.questionId}
                    type="button"
                    onClick={() => onJump(ans.questionId)}
                    className={cn(
                      "h-8 text-xs font-semibold rounded border transition-colors",
                      ans.isCorrect
                        ? "bg-secondary-50 border-secondary-300 text-secondary-700 hover:bg-secondary-100"
                        : ans.selected
                          ? "bg-tertiary-50 border-tertiary-300 text-tertiary-700 hover:bg-tertiary-100"
                          : "bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-secondary-50 border border-secondary-300" />
          <span className="text-slate-600">Đúng</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-tertiary-50 border border-tertiary-300" />
          <span className="text-slate-600">Sai</span>
        </p>
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-slate-50 border border-slate-300" />
          <span className="text-slate-600">Bỏ qua</span>
        </p>
      </div>
    </div>
  );
}
