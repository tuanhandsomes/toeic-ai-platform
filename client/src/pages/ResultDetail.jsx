import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, Trophy, BookOpen, Headphones,
  Lightbulb, RotateCw,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { resultService } from '@/services/resultService';
import { formatDuration } from '@/utils/formatTime';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const PART_NAMES = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi đáp',
  3: 'Part 3 — Đoạn hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn',
  7: 'Part 7 — Đọc hiểu',
};

export default function ResultDetail() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resultService
      .getById(id)
      .then((res) => {
        if (!cancelled) setResult(res.data.result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được kết quả');
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
              <p className="text-slate-600">{error || 'Không có dữ liệu'}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isFullTest = result.testType === 'full';
  const test = result.testId;
  const submittedDate = new Date(result.submittedAt).toLocaleString('vi-VN');

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-4">
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
            <h1 className="text-2xl font-heading font-bold">{test?.title || 'Kết quả bài làm'}</h1>
            <p className="text-sm text-slate-600">
              Nộp lúc {submittedDate} • Thời gian làm: {formatDuration(result.durationSec)}
            </p>
          </div>
          <Link
            to={test?.type === 'full' ? `/full-test/${test._id}` : `/practice/${test._id}`}
            className="btn-secondary text-sm"
          >
            <RotateCw className="w-4 h-4" /> Làm lại đề này
          </Link>
        </div>

        <ScoreBanner result={result} isFullTest={isFullTest} />

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="review">
              Đáp án chi tiết ({result.totalQuestions})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab result={result} />
          </TabsContent>

          <TabsContent value="review" className="mt-6">
            <ReviewTab result={result} />
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
                {result.scoreTotal} <span className="text-2xl text-primary-200">/ 990</span>
              </p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-100">Listening</p>
                  <p className="font-mono text-2xl font-bold">{result.scoreListening}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-100">Reading</p>
                  <p className="font-mono text-2xl font-bold">{result.scoreReading}</p>
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
              <span className="text-2xl text-slate-400"> / {result.totalQuestions}</span>
            </p>
            <p className="text-sm text-slate-600 mt-1">Số câu đúng</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-5xl font-bold text-secondary-600">{result.accuracy}%</p>
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
      part: Number(key.replace('part', '')),
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
                  <span className="text-slate-700">{PART_NAMES[p.part] || `Part ${p.part}`}</span>
                  <span className="font-mono font-semibold">
                    {p.correct}/{p.total} • {p.accuracy}%
                  </span>
                </div>
                <Progress
                  value={p.accuracy}
                  className={cn(
                    'h-2',
                    p.accuracy >= 80 && '[&>div]:bg-secondary-500',
                    p.accuracy >= 60 && p.accuracy < 80 && '[&>div]:bg-yellow-400',
                    p.accuracy < 60 && '[&>div]:bg-tertiary-500',
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
              <strong className="text-secondary-600">{result.correctCount}</strong>
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

function ReviewTab({ result }) {
  return (
    <div className="space-y-4">
      {result.answers.map((ans, idx) => {
        const q = ans.question;
        if (!q) return null;
        const userChose = ans.selected;
        const correct = q.correctAnswer;

        return (
          <Card key={ans.questionId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Câu {idx + 1}</span>
                  <Badge variant="muted">Part {q.part}</Badge>
                </div>
                {ans.isCorrect ? (
                  <span className="flex items-center gap-1 text-secondary-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Đúng
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-tertiary-600 text-sm font-medium">
                    <XCircle className="w-4 h-4" /> Sai
                  </span>
                )}
              </div>

              {q.content?.text && (
                <p className="text-slate-900 mb-3 whitespace-pre-wrap">{q.content.text}</p>
              )}

              <div className="space-y-2 mb-3">
                {q.options.map((opt) => {
                  const isUser = opt.key === userChose;
                  const isCorrect = opt.key === correct;
                  return (
                    <div
                      key={opt.key}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        isCorrect && 'border-secondary-300 bg-secondary-50',
                        !isCorrect && isUser && 'border-tertiary-300 bg-tertiary-50',
                        !isCorrect && !isUser && 'border-slate-200',
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0',
                          isCorrect && 'bg-secondary-500 text-white',
                          !isCorrect && isUser && 'bg-tertiary-500 text-white',
                          !isCorrect && !isUser && 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 text-slate-900">{opt.text}</span>
                      {isCorrect && (
                        <span className="text-xs font-medium text-secondary-700">
                          Đáp án đúng
                        </span>
                      )}
                      {isUser && !isCorrect && (
                        <span className="text-xs font-medium text-tertiary-700">Bạn chọn</span>
                      )}
                    </div>
                  );
                })}
                {userChose == null && (
                  <p className="text-xs text-slate-500 italic">Bạn không trả lời câu này.</p>
                )}
              </div>

              {q.explanation && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Giải thích</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
                      {q.vocab && q.vocab.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <p className="text-xs font-semibold text-yellow-900 mb-1.5">
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
