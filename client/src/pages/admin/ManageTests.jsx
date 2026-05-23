import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Search, Loader2, X, AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/adminService';

const PART_LABEL = (p) =>
  p === 1 ? 'Part 1 — Tranh'
  : p === 2 ? 'Part 2 — Hỏi đáp'
  : p === 3 ? 'Part 3 — Hội thoại'
  : p === 4 ? 'Part 4 — Bài nói'
  : p === 5 ? 'Part 5 — Câu hoàn'
  : p === 6 ? 'Part 6 — Đoạn hoàn'
  : p === 7 ? 'Part 7 — Đọc hiểu'
  : `Part ${p}`;

const blankTest = {
  title: '',
  description: '',
  type: 'part',
  part: 1,
  questionIds: [],
  durationMinutes: 10,
  difficulty: 'medium',
  series: '',
  year: '',
  isPublished: true,
};

export default function ManageTests() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', isPublished: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'
  const [editing, setEditing] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchTests = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filters.type !== 'all') params.type = filters.type;
        if (filters.isPublished !== 'all') params.isPublished = filters.isPublished === 'true';
        if (filters.search) params.search = filters.search;
        const res = await adminService.listTests(params);
        setItems(res.data.items);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchTests(1);
  }, [fetchTests]);

  const openCreate = () => {
    setEditing({ ...blankTest });
    setEditorMode('create');
    setEditorOpen(true);
  };

  const openEdit = async (test) => {
    setBusy(true);
    try {
      const res = await adminService.getTest(test._id);
      const full = res.data;
      setEditing({
        ...blankTest,
        ...full,
        year: full.year ?? '',
        part: full.part ?? 1,
      });
      setEditorMode('edit');
      setEditorOpen(true);
    } catch (err) {
      alert(err?.message || 'Không tải được đề');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (payload) => {
    setBusy(true);
    try {
      if (editorMode === 'create') {
        await adminService.createTest(payload);
      } else {
        await adminService.updateTest(editing._id, payload);
      }
      setEditorOpen(false);
      setEditing(null);
      await fetchTests(pagination.page);
    } catch (err) {
      alert(err?.message || 'Lưu thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await adminService.deleteTest(confirmDelete._id);
      setConfirmDelete(null);
      await fetchTests(pagination.page);
    } catch (err) {
      alert(err?.message || 'Xóa thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900">Quản lý đề thi</h1>
            <p className="text-sm text-slate-600 mt-1">
              Tạo, sửa, xóa các bài Practice và Full Test.
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Tạo đề mới
          </button>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFilters((f) => ({ ...f, search: searchInput }));
                }}
                className="flex-1 min-w-[240px]"
              >
                <label className="text-xs font-medium text-slate-700 block mb-1">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tiêu đề đề thi…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Loại</label>
                <Select
                  value={filters.type}
                  onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="full">Full Test</SelectItem>
                    <SelectItem value="part">Practice (Part)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Trạng thái</label>
                <Select
                  value={filters.isPublished}
                  onValueChange={(v) => setFilters((f) => ({ ...f, isPublished: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Đã xuất bản</SelectItem>
                    <SelectItem value="false">Nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-500">
                Chưa có đề nào. Bấm “Tạo đề mới” để thêm.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số câu</TableHead>
                    <TableHead className="text-right">Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        <p className="text-sm font-medium">{t.title}</p>
                        {t.series && (
                          <p className="text-xs text-slate-500">
                            {t.series}{t.year ? ` • ${t.year}` : ''}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.type === 'full' ? (
                          <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                            Full Test
                          </Badge>
                        ) : (
                          <Badge variant="muted">{PART_LABEL(t.part)}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {t.totalQuestions}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {t.durationMinutes} phút
                      </TableCell>
                      <TableCell>
                        {t.isPublished ? (
                          <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                            Đã xuất bản
                          </Badge>
                        ) : (
                          <Badge variant="muted">Nháp</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="w-3 h-3" /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(t)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-tertiary-200 text-tertiary-700 hover:bg-tertiary-50"
                          >
                            <Trash2 className="w-3 h-3" /> Xóa
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {pagination.total} đề • Trang {pagination.page}/{pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchTests(pagination.page - 1)}
                className="btn-ghost text-sm"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTests(pagination.page + 1)}
                className="btn-ghost text-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {editorOpen && editing && (
        <TestEditorDialog
          mode={editorMode}
          test={editing}
          busy={busy}
          onCancel={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-tertiary-500" />
              Xóa đề thi?
            </DialogTitle>
            <DialogDescription>
              Đề <strong>{confirmDelete?.title}</strong> sẽ bị xóa vĩnh viễn. Nếu đã có người làm bài
              thì sẽ không xóa được — hãy chuyển sang trạng thái “Nháp” thay vì xóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="btn-ghost text-sm"
              disabled={busy}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="btn bg-tertiary-500 text-white hover:bg-tertiary-600 text-sm"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Test editor dialog with embedded question picker
// ────────────────────────────────────────────────────────────────────────
function TestEditorDialog({ mode, test, busy, onCancel, onSave }) {
  const [form, setForm] = useState(test);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]); // [{_id, part, content, ...}]

  // Preload selected question metadata when editing
  useEffect(() => {
    if (mode !== 'edit' || !test.questionIds || test.questionIds.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        // Fetch in batches via questions list endpoint
        const items = [];
        const results = await Promise.all(
          test.questionIds.map((id) => adminService.getQuestion(id)),
        );
        if (cancelled) return;
        items.push(...results.map((r) => r.data.question));
        if (!cancelled) setSelectedQuestions(items);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, test.questionIds]);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description,
      type: form.type,
      part: form.type === 'part' ? Number(form.part) : null,
      questionIds: selectedQuestions.map((q) => q._id),
      durationMinutes: Number(form.durationMinutes),
      difficulty: form.difficulty,
      series: form.series,
      year: form.year ? Number(form.year) : null,
      isPublished: form.isPublished,
    };
    if (!payload.title || payload.questionIds.length === 0) {
      alert('Vui lòng nhập tiêu đề và chọn ít nhất 1 câu hỏi.');
      return;
    }
    onSave(payload);
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Tạo đề mới' : `Sửa đề: ${test.title}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="VD: ETS 2026 — Full Test 01"
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Loại</Label>
                <Select value={form.type} onValueChange={(v) => updateField('type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Test (200 câu)</SelectItem>
                    <SelectItem value="part">Practice (theo Part)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.type === 'part' && (
                <div>
                  <Label>Part</Label>
                  <Select
                    value={String(form.part)}
                    onValueChange={(v) => updateField('part', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          {PART_LABEL(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={form.durationMinutes}
                  onChange={(e) => updateField('durationMinutes', e.target.value)}
                />
              </div>
              <div>
                <Label>Series</Label>
                <Input
                  value={form.series}
                  onChange={(e) => updateField('series', e.target.value)}
                  placeholder="ETS 2026"
                />
              </div>
              <div>
                <Label>Năm</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  placeholder="2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Độ khó</Label>
                <Select value={form.difficulty} onValueChange={(v) => updateField('difficulty', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => updateField('isPublished', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Xuất bản
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label>Câu hỏi đã chọn ({selectedQuestions.length})</Label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="btn-ghost text-sm"
                >
                  <Plus className="w-4 h-4" /> Chọn từ ngân hàng
                </button>
              </div>
              {selectedQuestions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Chưa có câu hỏi nào.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
                  {selectedQuestions.map((q, idx) => (
                    <div key={q._id} className="flex items-center gap-2 px-3 py-2 text-sm">
                      <span className="text-xs font-mono text-slate-400 w-6">{idx + 1}</span>
                      <Badge variant="muted" className="text-xs">P{q.part}</Badge>
                      <span className="flex-1 truncate text-slate-700">
                        {q.content?.text || `(Câu Part ${q.part})`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuestions((prev) => prev.filter((x) => x._id !== q._id))
                        }
                        className="text-slate-400 hover:text-tertiary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <button type="button" onClick={onCancel} className="btn-ghost text-sm" disabled={busy}>
                Hủy
              </button>
              <button type="submit" disabled={busy} className="btn-primary text-sm">
                {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {mode === 'create' ? 'Tạo đề' : 'Lưu'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {pickerOpen && (
        <QuestionPickerDialog
          alreadySelected={selectedQuestions}
          onClose={() => setPickerOpen(false)}
          onConfirm={(picked) => {
            setSelectedQuestions(picked);
            setPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Question picker — fetch from bank with filter, multi-select
// ────────────────────────────────────────────────────────────────────────
function QuestionPickerDialog({ alreadySelected, onClose, onConfirm }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [partFilter, setPartFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedMap, setSelectedMap] = useState(() =>
    Object.fromEntries(alreadySelected.map((q) => [q._id, q])),
  );

  const fetchQuestions = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (partFilter !== 'all') params.part = Number(partFilter);
        if (search) params.search = search;
        const res = await adminService.listQuestions(params);
        setItems(res.data.items);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [partFilter, search],
  );

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  const toggle = (q) => {
    setSelectedMap((m) => {
      const copy = { ...m };
      if (copy[q._id]) delete copy[q._id];
      else copy[q._id] = q;
      return copy;
    });
  };

  const selectedArray = Object.values(selectedMap);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn câu hỏi từ ngân hàng ({selectedArray.length} đã chọn)</DialogTitle>
          <DialogDescription>
            Tick các câu để thêm vào đề. Lựa chọn giữ nguyên khi đổi trang/lọc.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
          }}
          className="flex gap-2 mb-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm theo nội dung…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={partFilter} onValueChange={setPartFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parts</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <SelectItem key={p} value={String(p)}>
                  Part {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>

        <div className="border border-slate-200 rounded-md max-h-96 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Không có câu hỏi.</p>
          ) : (
            items.map((q) => {
              const isSelected = !!selectedMap[q._id];
              return (
                <label
                  key={q._id}
                  className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer text-sm ${
                    isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(q)}
                    className="mt-1"
                  />
                  <Badge variant="muted" className="text-xs">P{q.part}</Badge>
                  <span className="flex-1 truncate text-slate-700">
                    {q.content?.text || `(Câu Part ${q.part}, đáp án ${q.correctAnswer})`}
                  </span>
                </label>
              );
            })
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-slate-600">
              Trang {pagination.page}/{pagination.totalPages} • {pagination.total} câu
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchQuestions(pagination.page - 1)}
                className="btn-ghost text-xs"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchQuestions(pagination.page + 1)}
                className="btn-ghost text-xs"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        <DialogFooter>
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedArray)}
            className="btn-primary text-sm"
          >
            Xác nhận ({selectedArray.length})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
