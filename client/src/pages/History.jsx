import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, ChevronRight, Calendar, Award, BookOpen, Clock,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { KpiCard } from '@/components/common/KpiCard';
import { EmptyState } from '@/components/common/EmptyState';
import { resultService } from '@/services/resultService';
import { formatDuration } from '@/utils/formatTime';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'full', label: 'Full Test' },
  { value: 'part', label: 'Luyện tập' },
];

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resultService
      .list({ limit: 100 })
      .then((res) => {
        if (!cancelled) setItems(res.data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được lịch sử');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((r) => r.testType === filter);
  }, [items, filter]);

  const stats = useMemo(() => {
    if (items.length === 0) return { total: 0, avgScore: 0, bestScore: 0, totalDurationSec: 0 };
    const fullTests = items.filter((r) => r.testType === 'full');
    const totalScores = fullTests.map((r) => r.scoreTotal).filter((s) => s > 0);
    return {
      total: items.length,
      avgScore: totalScores.length > 0
        ? Math.round(totalScores.reduce((s, n) => s + n, 0) / totalScores.length)
        : 0,
      bestScore: totalScores.length > 0 ? Math.max(...totalScores) : 0,
      totalDurationSec: items.reduce((s, r) => s + (r.durationSec || 0), 0),
    };
  }, [items]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Lịch sử bài làm</h1>
          <p className="text-slate-600">Tổng cộng {items.length} bài làm của bạn.</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={BookOpen} color="primary" label="Tổng bài" value={stats.total} bordered={false} />
          <KpiCard
            icon={Award}
            color="secondary"
            label="Cao nhất (Full)"
            value={stats.bestScore || '--'}
            bordered={false}
          />
          <KpiCard
            icon={Calendar}
            color="tertiary"
            label="TB Full Test"
            value={stats.avgScore || '--'}
            bordered={false}
          />
          <KpiCard
            icon={Clock}
            color="orange"
            label="Tổng thời gian"
            value={stats.totalDurationSec ? formatDuration(stats.totalDurationSec) : '0p'}
            bordered={false}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Đang tải...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="Bạn chưa có bài làm nào"
            description="Hãy bắt đầu bằng cách làm bài luyện tập đầu tiên."
            action={
              <Link to={ROUTES.PRACTICE} className="btn-primary">
                Bắt đầu luyện tập đầu tiên
              </Link>
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đề thi</TableHead>
                    <TableHead className="w-28">Loại</TableHead>
                    <TableHead className="w-32">Thời gian</TableHead>
                    <TableHead className="w-40 text-right">Điểm</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const test = r.testId;
                    const isFullTest = r.testType === 'full';
                    return (
                      <TableRow key={r._id}>
                        <TableCell>
                          <p className="font-medium text-slate-900">
                            {test?.title || 'Đề thi đã xóa'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(r.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isFullTest ? 'default' : 'secondary'}>
                            {isFullTest ? 'Full Test' : 'Luyện tập'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDuration(r.durationSec)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isFullTest ? (
                            <span className="font-mono font-bold text-slate-900">
                              {r.scoreTotal} <span className="text-xs text-slate-400">/990</span>
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-slate-900">
                              {r.correctCount}/{r.totalQuestions}
                              <span className="text-xs text-slate-400 ml-1">({r.accuracy}%)</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
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
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
