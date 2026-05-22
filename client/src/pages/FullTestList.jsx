import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileQuestion, Loader2, ClipboardCheck } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { testService } from '@/services/testService';

export default function FullTestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    testService
      .list({ type: 'full', limit: 50 })
      .then((res) => {
        if (!cancelled) setTests(res.data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được danh sách');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Tổng hợp đề thi</h1>
          <p className="text-slate-600">
            Đề thi mô phỏng đầy đủ định dạng TOEIC L&R: 200 câu, 120 phút. Chuẩn bị tai nghe và không gian yên tĩnh.
          </p>
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

        {!loading && !error && tests.length === 0 && (
          <EmptyState
            icon={ClipboardCheck}
            title="Chưa có đề thi nào"
            description="Quay lại sau khi admin thêm đề mới."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((t) => (
            <Link key={t._id} to={`/full-test/${t._id}`} className="block group">
              <Card className="hover:shadow-elevated transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-primary-500" />
                    </div>
                    <Badge variant="tertiary">Free</Badge>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-3 group-hover:text-primary-600">
                    {t.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {t.durationMinutes} phút
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileQuestion className="w-4 h-4" />
                      {t.totalQuestions} câu hỏi
                    </div>
                    <div className="text-xs">Series: {t.series || 'TOEIC AI Mock'}</div>
                    <div className="text-xs">Độ khó: {t.difficulty}</div>
                  </div>

                  <span className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg group-hover:bg-primary-600 transition-colors w-full">
                    Làm bài →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
