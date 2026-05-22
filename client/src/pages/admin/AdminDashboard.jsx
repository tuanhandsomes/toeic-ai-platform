import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardList, FileQuestion, Activity, TrendingUp, Loader2, AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/adminService';
import { ROUTES } from '@/constants/routes';
import { formatDuration } from '@/utils/formatTime';

const PART_LABELS = {
  1: 'Part 1', 2: 'Part 2', 3: 'Part 3', 4: 'Part 4', 5: 'Part 5', 6: 'Part 6', 7: 'Part 7',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService
      .stats()
      .then((res) => {
        if (!cancelled) setStats(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được thống kê');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto px-8 py-12">
          <Card>
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-tertiary-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-heading font-bold mb-1">Lỗi tải thống kê</h2>
                <p className="text-slate-600 text-sm">{error || 'Không có dữ liệu'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const kpis = [
    {
      label: 'Người dùng',
      value: stats.users.total,
      sub: `${stats.users.active} active • ${stats.users.admins} admin`,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      to: ROUTES.ADMIN_USERS,
    },
    {
      label: 'Đề thi',
      value: stats.tests.total,
      sub: `${stats.tests.published} đã xuất bản`,
      icon: ClipboardList,
      color: 'bg-emerald-100 text-emerald-600',
      to: ROUTES.ADMIN_TESTS,
    },
    {
      label: 'Câu hỏi',
      value: stats.questions.total,
      sub: 'Trong ngân hàng',
      icon: FileQuestion,
      color: 'bg-purple-100 text-purple-600',
      to: ROUTES.ADMIN_QUESTIONS,
    },
    {
      label: 'Lượt làm bài',
      value: stats.activity.totalResults,
      sub: `${stats.activity.totalAIAnalyses} phân tích AI`,
      icon: Activity,
      color: 'bg-tertiary-100 text-tertiary-600',
      to: null,
    },
  ];

  const maxPartCount = Math.max(...stats.questions.byPart.map((p) => p.count), 1);

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-600 mt-1">Thống kê thời gian thực toàn bộ nền tảng.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => {
            const Inner = (
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="font-mono text-3xl font-bold text-slate-900">{kpi.value}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{kpi.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
                </CardContent>
              </Card>
            );
            return kpi.to ? (
              <Link key={kpi.label} to={kpi.to}>
                {Inner}
              </Link>
            ) : (
              <div key={kpi.label}>{Inner}</div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Câu hỏi theo Part
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.questions.byPart.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có câu hỏi trong ngân hàng.</p>
              ) : (
                <div className="space-y-3">
                  {stats.questions.byPart.map((p) => (
                    <div key={p.part}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{PART_LABELS[p.part] || `Part ${p.part}`}</span>
                        <span className="font-mono font-semibold">{p.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${(p.count / maxPartCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bài làm gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.activity.recentResults.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có bài làm nào.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Đề</TableHead>
                      <TableHead className="text-right">Điểm/Độ chính xác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.activity.recentResults.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>
                          <p className="text-sm font-medium">{r.userId?.fullName || '(deleted)'}</p>
                          <p className="text-xs text-slate-500">{r.userId?.email}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{r.testId?.title || '(deleted)'}</p>
                          <Badge variant="muted" className="mt-0.5">
                            {r.testType === 'full' ? 'Full Test' : 'Practice'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.testType === 'full' ? (
                            <span className="font-mono font-bold">{r.scoreTotal}</span>
                          ) : (
                            <span className="font-mono font-bold">{r.accuracy}%</span>
                          )}
                          <p className="text-xs text-slate-500">{formatDuration(r.durationSec)}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
