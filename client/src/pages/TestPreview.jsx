import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  FileQuestion,
  Layers,
  Trophy,
  Loader2,
  PencilLine,
  ClipboardCheck,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testService } from "@/services/testService";
import { getDisplayDuration } from "@/constants/toeic";

const PART_LABEL = {
  1: "Part 1 — Mô tả tranh",
  2: "Part 2 — Hỏi đáp",
  3: "Part 3 — Đoạn hội thoại",
  4: "Part 4 — Bài nói ngắn",
  5: "Part 5 — Hoàn thành câu",
  6: "Part 6 — Hoàn thành đoạn",
  7: "Part 7 — Đọc hiểu",
};

export default function TestPreview() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    testService
      .getById(testId)
      .then((res) => {
        if (!cancelled) setTest(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không tải được đề thi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !test) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading font-bold mb-2">Lỗi tải đề thi</h2>
              <p className="text-slate-600 mb-4">
                {error || "Không có dữ liệu"}
              </p>
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary text-sm"
              >
                Quay lại
              </button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isFullTest = test.type === "full";
  // Count số Part khác nhau trong test (cho Practice luôn = 1, Full Test thường = 7)
  const partCount = isFullTest
    ? 7
    : new Set((test.questions || []).map((q) => q.part)).size || 1;
  // Điểm tối đa: Full Test = 990 (scaled), Practice = số câu × 5 (rule trong ScoreCard)
  const maxScore = isFullTest ? 990 : (test.totalQuestions || 0) * 5;
  const backRoute = isFullTest ? "/full-test" : "/practice";

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link
            to={backRoute}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 sm:p-10">
              <h1 className="text-3xl font-heading font-bold text-slate-900 text-center mb-4">
                {test.title}
              </h1>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge variant="tertiary">Free</Badge>
                {test.series && (
                  <Badge variant="muted">{test.series.toUpperCase()}</Badge>
                )}
                {!isFullTest && test.part && (
                  <Badge variant="secondary">Part {test.part}</Badge>
                )}
              </div>

              <ul className="space-y-2 text-slate-700 max-w-xs mx-auto mb-8">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" /> Thời gian:
                  </span>
                  <strong>{getDisplayDuration(test)} phút</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-4 h-4" /> Phần thi:
                  </span>
                  <strong>{partCount} phần</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <FileQuestion className="w-4 h-4" /> Câu hỏi:
                  </span>
                  <strong>{test.totalQuestions || 0} câu</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Trophy className="w-4 h-4" /> Điểm tối đa:
                  </span>
                  <strong>{maxScore} điểm</strong>
                </li>
              </ul>

              {!isFullTest && test.description && (
                <p className="text-sm text-slate-600 text-center max-w-md mx-auto mb-6 leading-relaxed">
                  {test.description}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {isFullTest ? (
                  <>
                    <Link
                      to={`/full-test/${test._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 text-white font-medium px-6 py-3 hover:bg-primary-600 transition-colors w-full sm:w-auto"
                    >
                      <ClipboardCheck className="w-4 h-4" /> Bắt đầu thi thử
                    </Link>
                    <Link
                      to={`/full-test/${test._id}?mode=practice`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white font-medium px-6 py-3 hover:bg-slate-800 transition-colors w-full sm:w-auto"
                    >
                      <PencilLine className="w-4 h-4" /> Luyện tập
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/practice/${test._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 text-white font-medium px-8 py-3 hover:bg-primary-600 transition-colors"
                  >
                    <PencilLine className="w-4 h-4" /> Bắt đầu luyện tập
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
