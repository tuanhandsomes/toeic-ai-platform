import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Loader2,
  Search,
  Trash2,
  Headphones,
  Image as ImageIcon,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
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
import { KpiCard } from '@/components/common/KpiCard';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;
const INITIAL_FILTERS = { type: 'all', search: '', usage: 'all' };

export default function ManageMedia() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ audio: 0, image: 0 });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pending, setPending] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await uploadService.list({ type: filters.type });
      setItems(res.data.items || []);
      setTotals({
        audio: res.data.totalAudio || 0,
        image: res.data.totalImage || 0,
      });
    } catch (err) {
      toast.error(err?.message || 'Không tải được danh sách media');
    } finally {
      setLoading(false);
    }
  }, [filters.type]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Search + usage filter chạy client-side trên items đã fetch.
  const filtered = useMemo(() => {
    let arr = items;
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      arr = arr.filter(
        (it) =>
          it.filename?.toLowerCase().includes(q) ||
          it.publicId?.toLowerCase().includes(q),
      );
    }
    if (filters.usage === 'used') arr = arr.filter((it) => it.usageCount > 0);
    if (filters.usage === 'unused') arr = arr.filter((it) => !it.usageCount);
    // Sort: chưa dùng + mới nhất lên đầu (để dễ xóa)
    return [...arr].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [items, filters.search, filters.usage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await uploadService.remove(
        confirmDelete.resourceType,
        confirmDelete.publicId,
      );
      toast.success('Đã xóa media');
      setConfirmDelete(null);
      await fetchMedia();
    } catch (err) {
      toast.error(err?.message || 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl((v) => (v === url ? null : v)), 1500);
    } catch {
      toast.error('Không sao chép được URL');
    }
  };

  const unusedCount = items.filter((it) => !it.usageCount).length;

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-slate-900">
            Quản lý media
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Quản lý audio và hình ảnh đã tải lên Cloudinary. File đang dùng
            trong câu hỏi không thể xóa.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={Headphones}
            color="primary"
            label="File âm thanh"
            value={totals.audio}
            sub="Định dạng MP3"
          />
          <KpiCard
            icon={ImageIcon}
            color="violet"
            label="Hình ảnh"
            value={totals.image}
            sub="Định dạng PNG, JPG"
          />
          <KpiCard
            icon={AlertCircle}
            color="orange"
            label="Chưa dùng"
            value={unusedCount}
            sub="Có thể xóa an toàn"
          />
        </div>

        {/* Filter bar */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilters(pending);
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tên file hoặc public ID…"
                    value={pending.search}
                    onChange={(e) =>
                      setPending((p) => ({ ...p, search: e.target.value }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Loại
                </label>
                <Select
                  value={pending.type}
                  onValueChange={(v) => setPending((p) => ({ ...p, type: v }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Trạng thái
                </label>
                <Select
                  value={pending.usage}
                  onValueChange={(v) => setPending((p) => ({ ...p, usage: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="used">Đang dùng</SelectItem>
                    <SelectItem value="unused">Chưa dùng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  <Search className="w-4 h-4" /> Tìm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPending(INITIAL_FILTERS);
                    setFilters(INITIAL_FILTERS);
                  }}
                  className="btn-ghost text-sm"
                >
                  Đặt lại
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Grid */}
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-500">
                Không có file media nào khớp với bộ lọc.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {paginated.map((it) => (
                  <MediaCard
                    key={it.publicId}
                    item={it}
                    onDelete={() => setConfirmDelete(it)}
                    onCopy={() => copyUrl(it.url)}
                    copied={copiedUrl === it.url}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                />
              </PaginationItem>
              {getPageRange(safePage, totalPages).map((p, idx) => (
                <PaginationItem key={`${p}-${idx}`}>
                  {p === '...' ? (
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
      </div>

      {/* Confirm delete */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && !deleting && setConfirmDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Xóa media?
            </DialogTitle>
            <DialogDescription>
              File{' '}
              <span className="font-mono text-slate-900">
                {confirmDelete?.filename}
              </span>{' '}
              sẽ bị xóa vĩnh viễn khỏi Cloudinary. Nếu đang được dùng ở câu hỏi
              nào, hệ thống sẽ chặn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              disabled={deleting}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function MediaCard({ item, onDelete, onCopy, copied }) {
  const isAudio = item.resourceType === 'audio';
  const isUsed = item.usageCount > 0;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white overflow-hidden flex flex-col',
        isUsed ? 'border-slate-200' : 'border-orange-200',
      )}
    >
      {/* Preview */}
      <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
        {isAudio ? (
          <div className="w-full px-3 flex flex-col items-center gap-2">
            <Headphones className="w-8 h-8 text-slate-400" />
            <audio
              controls
              src={item.url}
              className="w-full h-8"
              preload="none"
            />
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <p
            className="text-xs font-mono text-slate-900 truncate flex-1"
            title={item.filename}
          >
            {item.filename}
          </p>
          <Badge
            variant="muted"
            className={cn(
              'text-[10px] shrink-0',
              isAudio
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-violet-100 text-violet-700 border-violet-200',
            )}
          >
            {item.format?.toUpperCase() || (isAudio ? 'AUDIO' : 'IMG')}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>{formatBytes(item.bytes)}</span>
          {item.width && item.height && (
            <span>
              · {item.width}×{item.height}
            </span>
          )}
          {item.duration && (
            <span>· {Math.round(item.duration)}s</span>
          )}
        </div>

        <div>
          {isUsed ? (
            <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200 text-[10px]">
              Đang dùng ở {item.usageCount} câu hỏi
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
              Chưa dùng
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCopy}
            title="Sao chép URL"
            className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-secondary-600" /> Đã chép
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy URL
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isUsed}
            title={
              isUsed
                ? 'Gỡ khỏi câu hỏi đang dùng trước khi xóa'
                : 'Xóa file khỏi Cloudinary'
            }
            className="inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
