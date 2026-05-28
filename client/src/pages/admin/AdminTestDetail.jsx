import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  FileQuestion,
  Layers,
  Trophy,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPageRange,
} from "@/components/ui/pagination";
import { adminService } from "@/services/adminService";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const PART_LABEL = (p) =>
  p === 1
    ? "Part 1 — Mô tả tranh"
    : p === 2
      ? "Part 2 — Hỏi đáp"
      : p === 3
        ? "Part 3 — Đoạn hội thoại"
        : p === 4
          ? "Part 4 — Bài nói ngắn"
          : p === 5
            ? "Part 5 — Hoàn thành câu"
            : p === 6
              ? "Part 6 — Hoàn thành đoạn"
              : p === 7
                ? "Part 7 — Đọc hiểu"
                : `Part ${p}`;

const DIFFICULTY_LABEL = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const QUESTIONS_PER_PAGE = 10;

/**
 * Card hiển thị câu hỏi của 1 Part — có pagination riêng nếu Part dài
 * (vd Part 7 có 54 câu → 6 trang × 10).
 */
function PartQuestionsCard({ part, items }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / QUESTIONS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * QUESTIONS_PER_PAGE,
    safePage * QUESTIONS_PER_PAGE,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{PART_LABEL(part)}</span>
          <Badge variant="muted">{items.length} câu</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 pl-6">STT</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-32 text-center">Đáp án đúng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(({ q, idx }) => (
              <TableRow key={q._id}>
                <TableCell className="pl-6 font-mono text-sm text-slate-600">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-sm">
                  <p className="text-slate-700 line-clamp-2">
                    {q.content?.text ||
                      `(Câu Part ${q.part}${
                        q.content?.audioUrl ? " — có audio" : ""
                      }${q.content?.imageUrl ? " — có hình" : ""})`}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary-100 text-secondary-700 font-mono font-bold text-sm">
                    {q.correctAnswer}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination className="py-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                />
              </PaginationItem>
              {getPageRange(safePage, totalPages).map((p, idx) => (
                <PaginationItem key={`${p}-${idx}`}>
                  {p === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={p === safePage}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminTestDetail() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService
      .getTest(testId)
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

  // Group câu hỏi theo Part để render gọn
  const questionsByPart = useMemo(() => {
    if (!test?.questions) return [];
    const map = new Map();
    test.questions.forEach((q, idx) => {
      if (!map.has(q.part)) map.set(q.part, []);
      map.get(q.part).push({ q, idx });
    });
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [test]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteTest(testId);
      toast.success(`Đã xóa đề "${test.title}"`);
      navigate(ROUTES.ADMIN_TESTS);
    } catch (err) {
      toast.error(err?.message || "Xóa thất bại");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !test) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading font-bold mb-2">Lỗi tải đề thi</h2>
              <p className="text-slate-600 mb-4">
                {error || "Không có dữ liệu"}
              </p>
              <Link to={ROUTES.ADMIN_TESTS} className="btn-secondary text-sm">
                Quay lại
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const isFullTest = test.type === "full";
  const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link
            to={ROUTES.ADMIN_TESTS}
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đề
          </Link>
        </div>

        {/* Header: title + badges + actions */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold mb-2">
              {test.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {isFullTest ? (
                <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                  Full Test
                </Badge>
              ) : (
                <Badge variant="muted">{PART_LABEL(test.part)}</Badge>
              )}
              {test.isPublished ? (
                <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Đã xuất bản
                </Badge>
              ) : (
                <Badge variant="muted">Nháp</Badge>
              )}
              {test.series && <Badge variant="muted">{test.series}</Badge>}
              {test.year && <Badge variant="muted">{test.year}</Badge>}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={ROUTES.ADMIN_TESTS}
              state={{ editTestId: test._id }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Pencil className="w-4 h-4" /> Sửa
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-tertiary-200 text-tertiary-700 hover:bg-tertiary-50"
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" /> Thời gian
              </div>
              <p className="text-2xl font-heading font-bold">
                {test.durationMinutes}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  phút
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <FileQuestion className="w-3.5 h-3.5" /> Số câu
              </div>
              <p className="text-2xl font-heading font-bold">
                {test.totalQuestions || 0}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  câu
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Layers className="w-3.5 h-3.5" /> Phần thi
              </div>
              <p className="text-2xl font-heading font-bold">
                {questionsByPart.length}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  phần
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Trophy className="w-3.5 h-3.5" /> Độ khó
              </div>
              <p className="text-2xl font-heading font-bold capitalize">
                {DIFFICULTY_LABEL[test.difficulty] || test.difficulty}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Description + dates */}
        {(test.description || test.createdAt || test.updatedAt) && (
          <Card className="mb-6">
            <CardContent className="p-6 space-y-3 text-sm">
              {test.description && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Mô tả
                  </p>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {test.description}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Tạo:{" "}
                  {fmtDate(test.createdAt)}
                </span>
                {test.updatedAt && test.updatedAt !== test.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Cập nhật:{" "}
                    {fmtDate(test.updatedAt)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question list grouped by Part */}
        <div className="space-y-5">
          {questionsByPart.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-slate-500 italic">
                Đề này chưa có câu hỏi nào.
              </CardContent>
            </Card>
          ) : (
            questionsByPart.map(([part, items]) => (
              <PartQuestionsCard key={part} part={part} items={items} />
            ))
          )}
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa đề thi?</DialogTitle>
            <DialogDescription>
              Đề <strong className="text-slate-900">"{test.title}"</strong> sẽ
              bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-tertiary-500 text-white hover:bg-tertiary-600 disabled:opacity-50"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Xóa đề
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
