import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Target,
  BookOpen,
  Clock,
  PenTool,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  History as HistoryIcon,
  Loader2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/KpiCard";
import { useAuthStore } from "@/store/authStore";
import { resultService } from "@/services/resultService";
import { ROUTES } from "@/constants/routes";
import { formatDuration } from "@/utils/formatTime";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resultService
      .list({ limit: 50 })
      .then((res) => {
        if (!cancelled) setResults(res.data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const fullTests = results.filter(
      (r) => r.testType === "full" && r.scoreTotal > 0,
    );
    const latestScore = fullTests[0]?.scoreTotal || null;
    const totalDuration = results.reduce((s, r) => s + (r.durationSec || 0), 0);
    return {
      latestScore,
      totalAttempts: results.length,
      totalDuration,
    };
  }, [results]);

  const recent = results.slice(0, 5);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Xin chào, {user?.fullName?.split(" ").pop() || "bạn"} 👋
          </h1>
          <p className="text-slate-600">
            Mục tiêu của bạn: {user?.targetScore || 700} điểm. Hôm nay luyện gì
            nào?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={Target}
            color="primary"
            label="Điểm gần nhất"
            value={stats.latestScore || "--"}
            sub={stats.latestScore ? "Full Test" : "Chưa có Full Test"}
          />
          <KpiCard
            icon={Target}
            color="secondary"
            label="Mục tiêu"
            value={user?.targetScore || 700}
            sub={
              stats.latestScore && user?.targetScore
                ? `Còn ${Math.max(0, user.targetScore - stats.latestScore)} điểm`
                : null
            }
          />
          <KpiCard
            icon={BookOpen}
            color="tertiary"
            label="Bài đã làm"
            value={stats.totalAttempts}
          />
          <KpiCard
            icon={Clock}
            color="orange"
            label="Tổng thời gian"
            value={
              stats.totalDuration ? formatDuration(stats.totalDuration) : "0p"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <HistoryIcon className="w-5 h-5 text-primary-500" />
                Hoạt động gần đây
              </CardTitle>
              <Link
                to={ROUTES.RESULTS}
                className="text-sm text-primary-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : recent.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500 mb-3">
                    Bạn chưa có bài làm nào.
                  </p>
                  <Link
                    to={ROUTES.PRACTICE}
                    className="btn-primary text-sm inline-flex"
                  >
                    Bắt đầu luyện tập đầu tiên
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recent.map((r) => {
                    const isFullTest = r.testType === "full";
                    return (
                      <Link
                        key={r._id}
                        to={`/results/${r._id}`}
                        className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">
                            {r.testId?.title || "Đề thi"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(r.submittedAt).toLocaleString("vi-VN")}
                            {" • "}
                            {formatDuration(r.durationSec)}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          {isFullTest ? (
                            <p className="font-mono font-bold text-slate-900">
                              {r.scoreTotal}
                            </p>
                          ) : (
                            <p className="font-mono font-bold text-slate-900">
                              {r.correctCount}/{r.totalQuestions}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            {isFullTest ? "Total" : `${r.accuracy}%`}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="w-5 h-5 text-orange-500" />
                Mẹo cho bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex gap-2">
                  <span>✓</span> Luyện đều mỗi ngày 30 phút hiệu quả hơn 4 tiếng
                  cuối tuần.
                </li>
                <li className="flex gap-2">
                  <span>✓</span> Làm Full Test 1 lần/tuần để theo dõi tiến bộ.
                </li>
                <li className="flex gap-2">
                  <span>✓</span> Đọc giải thích từng câu sai — đó là nơi bạn học
                  nhanh nhất.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-heading font-bold mb-4">Bắt đầu nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            to={ROUTES.PRACTICE}
            icon={PenTool}
            title="Luyện theo Part"
            description="Luyện từng Part 1-7 với bài tập ngắn"
          />
          <QuickAction
            to={ROUTES.FULL_TEST}
            icon={ClipboardCheck}
            title="Thi thử Full Test"
            description="Mô phỏng đầy đủ 200 câu, 120 phút"
          />
          <QuickAction
            to={ROUTES.STATISTICS}
            icon={BarChart3}
            title="Xem thống kê"
            description="Theo dõi tiến bộ qua biểu đồ"
          />
        </div>
      </div>
    </AppLayout>
  );
}

function QuickAction({ to, icon: Icon, title, description }) {
  return (
    <Link to={to} className="block">
      <Card className="hover:shadow-elevated transition-shadow group">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-slate-900 mb-0.5">
              {title}
            </h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
