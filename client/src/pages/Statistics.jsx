import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, LabelList } from 'recharts';
import {
  Loader2, TrendingUp, Clock, FileQuestion, Target, Trophy,
  ChevronRight,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { KpiCard } from '@/components/common/KpiCard';
import { RankBadge } from '@/components/common/RankBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { resultService } from '@/services/resultService';
import { useAuthStore } from '@/store/authStore';

const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateMMDD = (date) => {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

function build7DayBuckets(results, offsetDays = 0) {
  const buckets = [];
  const startDate = new Date(TODAY);
  startDate.setDate(TODAY.getDate() - offsetDays);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() - i);
    buckets.push({
      key: dayKey(d),
      date: d,
      label: formatDateMMDD(d),
      minutes: 0,
      accuracySum: 0,
      questions: 0,
      count: 0,
    });
  }

  const map = new Map(buckets.map((b) => [b.key, b]));
  results.forEach((r) => {
    const key = dayKey(r.submittedAt);
    const b = map.get(key);
    if (b) {
      b.minutes += Math.round((r.durationSec || 0) / 60);
      b.questions += r.totalQuestions || 0;
      b.accuracySum += r.accuracy || 0;
      b.count += 1;
    }
  });

  return buckets.map((b) => ({
    ...b,
    avgAccuracy: b.count > 0 ? Math.round(b.accuracySum / b.count) : 0,
  }));
}

// Chart configs — shadcn convention
const studyTimeConfig = {
  minutes: {
    label: 'Phút học',
    color: 'hsl(var(--chart-3))', // terracotta
  },
};

const scoreProgressConfig = {
  avgAccuracy: {
    label: 'Độ chính xác',
    color: 'hsl(var(--chart-1))', // indigo
  },
};

export default function Statistics() {
  const user = useAuthStore((s) => s.user);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resultService
      .list({ limit: 100 })
      .then((res) => {
        if (!cancelled) setResults(res.data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được dữ liệu');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const thisWeek = build7DayBuckets(results, 0);
    const lastWeek = build7DayBuckets(results, 7);

    const dateRange = `${thisWeek[0].label} - ${thisWeek[6].label}`;

    const sum = (arr, key) => arr.reduce((s, b) => s + b[key], 0);
    const thisCount = sum(thisWeek, 'count');
    const lastCount = sum(lastWeek, 'count');
    const thisQuestions = sum(thisWeek, 'questions');
    const lastQuestions = sum(lastWeek, 'questions');
    const thisMinutes = sum(thisWeek, 'minutes');
    const lastMinutes = sum(lastWeek, 'minutes');

    const computeAvgAccuracy = (week) => {
      const c = sum(week, 'count');
      if (c === 0) return 0;
      const totalAcc = week.reduce((s, b) => s + b.accuracySum, 0);
      return Math.round(totalAcc / c);
    };
    const thisAccuracy = computeAvgAccuracy(thisWeek);
    const lastAccuracy = computeAvgAccuracy(lastWeek);

    const change = (now, prev) => {
      if (prev === 0) return now > 0 ? null : 0;
      return Math.round(((now - prev) / prev) * 100);
    };

    const ranked = results
      .slice()
      .map((r) => ({
        ...r,
        rankScore: r.testType === 'full' ? r.scoreTotal : r.accuracy * 10,
      }))
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, 10);

    return {
      dateRange,
      thisWeek,
      kpis: {
        tests: { value: thisCount, change: change(thisCount, lastCount) },
        questions: { value: thisQuestions, change: change(thisQuestions, lastQuestions) },
        minutes: { value: thisMinutes, change: change(thisMinutes, lastMinutes) },
        accuracy: { value: thisAccuracy, change: change(thisAccuracy, lastAccuracy) },
      },
      ranked,
      target: user?.targetScore || 700,
    };
  }, [results, user]);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Thống kê tiến bộ</h1>
          <p className="text-slate-600">
            Phân tích hành trình luyện thi 7 ngày qua dựa trên dữ liệu bài làm.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <EmptyState
            icon={TrendingUp}
            title="Chưa có dữ liệu thống kê"
            description="Hoàn thành ít nhất 1 bài làm để xem biểu đồ tiến bộ."
            action={
              <Link to="/practice" className="btn-primary">
                Bắt đầu luyện tập
              </Link>
            }
          />
        )}

        {!loading && results.length > 0 && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                icon={FileQuestion}
                color="primary"
                label="Bài đã làm"
                value={stats.kpis.tests.value}
                unit="bài"
                change={stats.kpis.tests.change}
              />
              <KpiCard
                icon={Target}
                color="secondary"
                label="Câu đã làm"
                value={stats.kpis.questions.value.toLocaleString('vi-VN')}
                unit="câu"
                change={stats.kpis.questions.change}
              />
              <KpiCard
                icon={Clock}
                color="tertiary"
                label="Thời gian học"
                value={stats.kpis.minutes.value}
                unit="phút"
                change={stats.kpis.minutes.change}
              />
              <KpiCard
                icon={TrendingUp}
                color="violet"
                label="Độ chính xác"
                value={stats.kpis.accuracy.value}
                unit="%"
                change={stats.kpis.accuracy.change}
              />
            </div>

            {/* Two 7-day charts */}
            <section className="mb-8">
              <div className="mb-4">
                <h2 className="font-heading font-semibold text-xl">Hoạt động 7 ngày qua</h2>
                <p className="text-sm text-slate-500">{stats.dateRange}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Study time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-4 h-4 text-tertiary-600" />
                      Thời gian học trong 7 ngày
                    </CardTitle>
                    <CardDescription>{stats.dateRange}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={studyTimeConfig} className="h-[220px] w-full">
                      <LineChart
                        data={stats.thisWeek}
                        margin={{ top: 24, right: 16, left: 16, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={11}
                        />
                        <YAxis hide domain={[0, 'dataMax + 20']} />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(label) => `Ngày ${label}`}
                              indicator="dot"
                            />
                          }
                        />
                        <Line
                          dataKey="minutes"
                          type="monotone"
                          stroke="var(--color-minutes)"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: 'var(--color-minutes)', strokeWidth: 0 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                        >
                          <LabelList
                            dataKey="minutes"
                            position="top"
                            offset={10}
                            className="fill-slate-900"
                            fontSize={12}
                            fontWeight={600}
                          />
                        </Line>
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Chart 2: Score progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                      Tiến độ điểm số trong 7 ngày
                    </CardTitle>
                    <CardDescription>Độ chính xác trung bình mỗi ngày</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={scoreProgressConfig} className="h-[220px] w-full">
                      <LineChart
                        data={stats.thisWeek}
                        margin={{ top: 24, right: 16, left: 16, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={11}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(label) => `Ngày ${label}`}
                              indicator="dot"
                              formatter={(value) => [`${value}%`, ' Độ chính xác']}
                            />
                          }
                        />
                        <Line
                          dataKey="avgAccuracy"
                          type="monotone"
                          stroke="var(--color-avgAccuracy)"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: 'var(--color-avgAccuracy)', strokeWidth: 0 }}
                          activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }}
                        >
                          <LabelList
                            dataKey="avgAccuracy"
                            position="top"
                            offset={10}
                            className="fill-slate-900"
                            fontSize={12}
                            fontWeight={600}
                            formatter={(value) => (value > 0 ? `${value}%` : '')}
                          />
                        </Line>
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Ranking table */}
            <section>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Bảng xếp hạng điểm số
                      </CardTitle>
                      <CardDescription>Top 10 bài làm tốt nhất của bạn</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center pl-6">Hạng</TableHead>
                        <TableHead>Bài thi</TableHead>
                        <TableHead className="w-28">Loại</TableHead>
                        <TableHead className="w-32">Ngày làm</TableHead>
                        <TableHead className="w-32 text-right">Điểm</TableHead>
                        <TableHead className="w-12 pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.ranked.map((r, i) => {
                        const isFullTest = r.testType === 'full';
                        const date = new Date(r.submittedAt).toLocaleDateString('vi-VN');
                        return (
                          <TableRow key={r._id}>
                            <TableCell className="text-center pl-6">
                              <RankBadge rank={i + 1} />
                            </TableCell>
                            <TableCell className="font-medium">
                              {r.testId?.title || 'Đề thi'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={isFullTest ? 'default' : 'secondary'}>
                                {isFullTest ? 'Full Test' : 'Luyện tập'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">{date}</TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {isFullTest ? (
                                <>
                                  {r.scoreTotal}
                                  <span className="text-xs text-slate-400 ml-1">/990</span>
                                </>
                              ) : (
                                <>
                                  {r.accuracy}%
                                  <span className="text-xs text-slate-400 ml-1">
                                    ({r.correctCount}/{r.totalQuestions})
                                  </span>
                                </>
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Link
                                to={`/results/${r._id}`}
                                className="inline-flex items-center text-primary-600 hover:text-primary-700"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {stats.ranked.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      Chưa có bài làm nào trong bảng xếp hạng.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
