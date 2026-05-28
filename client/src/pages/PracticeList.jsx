import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, FileQuestion, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDisplayDuration } from '@/constants/toeic';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPageRange,
} from '@/components/ui/pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { testService } from '@/services/testService';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 9;

const PART_INFO = {
  1: { label: 'Part 1', desc: 'Mô tả tranh' },
  2: { label: 'Part 2', desc: 'Hỏi đáp' },
  3: { label: 'Part 3', desc: 'Đoạn hội thoại' },
  4: { label: 'Part 4', desc: 'Bài nói ngắn' },
  5: { label: 'Part 5', desc: 'Hoàn thành câu' },
  6: { label: 'Part 6', desc: 'Hoàn thành đoạn' },
  7: { label: 'Part 7', desc: 'Đọc hiểu' },
};

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: '1', label: 'Part 1' },
  { value: '2', label: 'Part 2' },
  { value: '3', label: 'Part 3' },
  { value: '4', label: 'Part 4' },
  { value: '5', label: 'Part 5' },
  { value: '6', label: 'Part 6' },
  { value: '7', label: 'Part 7' },
];

export default function PracticeList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    testService
      .list({ type: 'part', limit: 50 })
      .then((res) => {
        if (!cancelled) setTests(res.data.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Không tải được danh sách bài luyện');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return tests;
    return tests.filter((t) => String(t.part) === filter);
  }, [tests, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const { listening, reading } = useMemo(() => {
    const listening = paginated.filter((t) => t.part >= 1 && t.part <= 4);
    const reading = paginated.filter((t) => t.part >= 5 && t.part <= 7);
    return { listening, reading };
  }, [paginated]);

  const goToPage = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Luyện tập theo Part</h1>
          <p className="text-slate-600">
            Chọn phần thi bạn muốn luyện tập. Mỗi Part có nhiều bộ đề từ dễ đến khó.
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                filter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200',
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
            icon={FileQuestion}
            title="Không có bài luyện cho lựa chọn này"
            description="Thử chọn Part khác hoặc bỏ bộ lọc."
          />
        )}

        {!loading && listening.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-secondary-600" />
              <h2 className="text-xl font-heading font-bold">LISTENING (Part 1-4)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listening.map((t) => (
                <TestCard key={t._id} test={t} />
              ))}
            </div>
          </section>
        )}

        {!loading && reading.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-tertiary-600" />
              <h2 className="text-xl font-heading font-bold">READING (Part 5-7)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reading.map((t) => (
                <TestCard key={t._id} test={t} />
              ))}
            </div>
          </section>
        )}

        {!loading && totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safePage <= 1}
                  onClick={() => goToPage(safePage - 1)}
                />
              </PaginationItem>
              {getPageRange(safePage, totalPages).map((p, idx) => (
                <PaginationItem key={`${p}-${idx}`}>
                  {p === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={p === safePage}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  disabled={safePage >= totalPages}
                  onClick={() => goToPage(safePage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AppLayout>
  );
}

function TestCard({ test }) {
  const partInfo = PART_INFO[test.part] || {};

  return (
    <Link to={`/tests/${test._id}`} className="block group">
      <Card className="hover:shadow-elevated transition-shadow h-full relative overflow-hidden">
        {/* Badge Free góc trên phải */}
        <Badge
          variant="tertiary"
          className="absolute top-3 right-3 z-10"
        >
          Free
        </Badge>

        <CardContent className="p-6">
          <h3 className="font-heading font-bold text-lg text-slate-900 mb-4 pr-14 group-hover:text-primary-600 transition-colors">
            {test.title}
          </h3>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600 mb-4">
            <div>
              Thời gian:{' '}
              <strong className="text-slate-900">
                {getDisplayDuration(test)} phút
              </strong>
            </div>
            <div>
              Câu hỏi:{' '}
              <strong className="text-slate-900">
                {test.totalQuestions} câu
              </strong>
            </div>
            <div>
              Phần thi:{' '}
              <strong className="text-slate-900">
                {partInfo.label || `Part ${test.part}`}
              </strong>
            </div>
            <div>
              Loại:{' '}
              <strong className="text-slate-900">{partInfo.desc || '—'}</strong>
            </div>
          </div>

          {test.series && (
            <Badge variant="muted" className="mb-4">
              {test.series.toUpperCase()}
            </Badge>
          )}

          <div>
            <span className="inline-flex items-center justify-center px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-full group-hover:bg-primary-600 transition-colors">
              Làm bài
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
