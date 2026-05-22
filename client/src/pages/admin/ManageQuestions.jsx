import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Search, Loader2, Upload, AlertCircle, FileJson,
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

const PART_TYPE_DEFAULT = {
  1: 'photograph',
  2: 'question_response',
  3: 'conversation',
  4: 'talk',
  5: 'incomplete_sentence',
  6: 'text_completion',
  7: 'reading_comprehension',
};

const blankQuestion = (part = 1) => ({
  part,
  type: PART_TYPE_DEFAULT[part],
  content: { text: '', audioUrl: '', imageUrl: '', passageId: null },
  options:
    part === 2
      ? [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
        ]
      : [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
  correctAnswer: 'A',
  explanation: '',
  vocab: [],
  difficulty: 'medium',
  tags: [],
});

export default function ManageQuestions() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ part: 'all', difficulty: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const [importOpen, setImportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchQuestions = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filters.part !== 'all') params.part = Number(filters.part);
        if (filters.difficulty !== 'all') params.difficulty = filters.difficulty;
        if (filters.search) params.search = filters.search;
        const res = await adminService.listQuestions(params);
        setItems(res.data.items);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  const openCreate = () => {
    setEditing(blankQuestion(1));
    setEditorMode('create');
    setEditorOpen(true);
  };

  const openEdit = async (q) => {
    setBusy(true);
    try {
      const res = await adminService.getQuestion(q._id);
      setEditing(res.data.question);
      setEditorMode('edit');
      setEditorOpen(true);
    } catch (err) {
      alert(err?.message || 'Không tải được câu hỏi');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (payload) => {
    setBusy(true);
    try {
      if (editorMode === 'create') {
        await adminService.createQuestion(payload);
      } else {
        await adminService.updateQuestion(editing._id, payload);
      }
      setEditorOpen(false);
      setEditing(null);
      await fetchQuestions(pagination.page);
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
      await adminService.deleteQuestion(confirmDelete._id);
      setConfirmDelete(null);
      await fetchQuestions(pagination.page);
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
            <h1 className="text-2xl font-heading font-bold text-slate-900">Quản lý câu hỏi</h1>
            <p className="text-sm text-slate-600 mt-1">
              Tạo từng câu hoặc import JSON hàng loạt vào ngân hàng đề.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="btn-secondary text-sm">
              <Upload className="w-4 h-4" /> Import JSON
            </button>
            <button onClick={openCreate} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
          </div>
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
                    placeholder="Nội dung hoặc giải thích…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Part</label>
                <Select
                  value={filters.part}
                  onValueChange={(v) => setFilters((f) => ({ ...f, part: v }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <SelectItem key={p} value={String(p)}>
                        Part {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Độ khó</label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
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
                Ngân hàng trống. Bấm “Thêm câu hỏi” hoặc “Import JSON”.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Đáp án</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((q) => (
                    <TableRow key={q._id}>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate">
                          {q.content?.text || (
                            <span className="italic text-slate-400">(Không có text)</span>
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">Part {q.part}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-semibold text-secondary-600">
                          {q.correctAnswer}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{q.difficulty}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {(q.tags || []).slice(0, 3).map((t) => (
                            <Badge key={t} variant="muted" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                          {(q.tags || []).length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{q.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(q)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="w-3 h-3" /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(q)}
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
              {pagination.total} câu • Trang {pagination.page}/{pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchQuestions(pagination.page - 1)}
                className="btn-ghost text-sm"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchQuestions(pagination.page + 1)}
                className="btn-ghost text-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {editorOpen && editing && (
        <QuestionEditorDialog
          mode={editorMode}
          question={editing}
          busy={busy}
          onCancel={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {importOpen && (
        <ImportJsonDialog
          onClose={() => setImportOpen(false)}
          onDone={() => {
            setImportOpen(false);
            fetchQuestions(1);
          }}
        />
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-tertiary-500" />
              Xóa câu hỏi?
            </DialogTitle>
            <DialogDescription>
              Câu hỏi sẽ bị xóa vĩnh viễn. Nếu đang được dùng trong đề thi nào đó thì hệ thống sẽ
              chặn — phải gỡ khỏi đề trước.
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
// Editor: full form for one question
// ────────────────────────────────────────────────────────────────────────
function QuestionEditorDialog({ mode, question, busy, onCancel, onSave }) {
  const [form, setForm] = useState(question);

  // Adjust options array when part toggles between 2 and other
  const handlePartChange = (newPart) => {
    const part = Number(newPart);
    setForm((f) => {
      const needsTrim = part === 2 && f.options.length === 4;
      const needsAdd = part !== 2 && f.options.length === 3;
      let options = f.options;
      if (needsTrim) options = f.options.slice(0, 3);
      if (needsAdd) options = [...f.options, { key: 'D', text: '' }];
      return {
        ...f,
        part,
        type: PART_TYPE_DEFAULT[part] || f.type,
        options,
        correctAnswer: part === 2 && f.correctAnswer === 'D' ? 'A' : f.correctAnswer,
      };
    });
  };

  const updateContent = (key, value) =>
    setForm((f) => ({ ...f, content: { ...f.content, [key]: value } }));

  const updateOption = (idx, value) => {
    setForm((f) => {
      const options = [...f.options];
      options[idx] = { ...options[idx], text: value };
      return { ...f, options };
    });
  };

  const updateTagsInput = (raw) => {
    const tags = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((f) => ({ ...f, tags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    const allOptionsFilled = form.options.every((o) => o.text.trim().length > 0);
    if (!allOptionsFilled) {
      alert('Vui lòng nhập nội dung cho tất cả đáp án.');
      return;
    }
    const payload = {
      part: form.part,
      type: form.type,
      content: form.content,
      options: form.options,
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
      vocab: form.vocab,
      difficulty: form.difficulty,
      tags: form.tags,
    };
    onSave(payload);
  };

  const validKeys = form.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm câu hỏi mới' : `Sửa câu hỏi (Part ${question.part})`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Part *</Label>
              <Select value={String(form.part)} onValueChange={handlePartChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      Part {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.part === 2 && (
                <p className="text-xs text-yellow-700 mt-1">Part 2 chỉ có 3 đáp án A/B/C.</p>
              )}
            </div>
            <div>
              <Label>Độ khó</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm((f) => ({ ...f, difficulty: v }))}
              >
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
          </div>

          <div>
            <Label>Nội dung câu hỏi</Label>
            <textarea
              value={form.content.text}
              onChange={(e) => updateContent('text', e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Để trống nếu Part 1 (chỉ có ảnh + audio)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Audio URL</Label>
              <Input
                value={form.content.audioUrl}
                onChange={(e) => updateContent('audioUrl', e.target.value)}
                placeholder="/audio/…/file.mp3"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={form.content.imageUrl}
                onChange={(e) => updateContent('imageUrl', e.target.value)}
                placeholder="/images/…/file.png"
              />
            </div>
          </div>

          <div>
            <Label>Đáp án *</Label>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="correct"
                      checked={form.correctAnswer === opt.key}
                      onChange={() => setForm((f) => ({ ...f, correctAnswer: opt.key }))}
                    />
                    <span className="font-mono font-semibold w-5">{opt.key}.</span>
                  </label>
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Đáp án ${opt.key}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Đáp án đúng:{' '}
              <strong className="text-secondary-600">{form.correctAnswer}</strong>
              {!validKeys.includes(form.correctAnswer) && (
                <span className="text-tertiary-600 ml-1">(Vui lòng chọn lại)</span>
              )}
            </p>
          </div>

          <div>
            <Label>Giải thích</Label>
            <textarea
              value={form.explanation}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Vì sao đáp án này đúng…"
            />
          </div>

          <div>
            <Label>Tags (phân cách bằng dấu phẩy)</Label>
            <Input
              defaultValue={(form.tags || []).join(', ')}
              onBlur={(e) => updateTagsInput(e.target.value)}
              placeholder="ets-2026, part1, easy"
            />
          </div>

          <DialogFooter>
            <button type="button" onClick={onCancel} className="btn-ghost text-sm" disabled={busy}>
              Hủy
            </button>
            <button type="submit" disabled={busy} className="btn-primary text-sm">
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {mode === 'create' ? 'Tạo câu hỏi' : 'Lưu'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Import JSON dialog — paste OR upload file
// ────────────────────────────────────────────────────────────────────────
function ImportJsonDialog({ onClose, onDone }) {
  const [raw, setRaw] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setRaw(text);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      setError('JSON không hợp lệ: ' + err.message);
      return;
    }
    let questions;
    if (Array.isArray(parsed)) {
      questions = parsed;
    } else if (Array.isArray(parsed.questions)) {
      questions = parsed.questions;
    } else {
      setError('JSON phải là array câu hỏi hoặc object có field "questions".');
      return;
    }

    const defaultTags = tagsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setBusy(true);
    try {
      const res = await adminService.importQuestions({ questions, defaultTags });
      setSuccess(`Đã import ${res.data.insertedCount} câu hỏi.`);
      setTimeout(onDone, 1200);
    } catch (err) {
      setError(err?.message || 'Import thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary-500" />
            Import câu hỏi từ JSON
          </DialogTitle>
          <DialogDescription>
            Dán JSON hoặc upload file. Format: array câu hỏi, hoặc object{' '}
            <code className="bg-slate-100 px-1 rounded">{'{ questions: [...] }'}</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>File JSON</Label>
            <Input
              type="file"
              accept="application/json"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div>
            <Label>Hoặc dán trực tiếp</Label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-mono"
              placeholder='[{"part": 1, "options": [...], "correctAnswer": "A"}, ...]'
            />
          </div>

          <div>
            <Label>Tag mặc định (phân cách dấu phẩy)</Label>
            <Input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="ets-2026, batch-1"
            />
          </div>

          {error && (
            <div className="rounded-md bg-tertiary-50 border border-tertiary-200 px-3 py-2 text-sm text-tertiary-800">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-secondary-50 border border-secondary-200 px-3 py-2 text-sm text-secondary-800">
              {success}
            </div>
          )}
        </div>

        <DialogFooter>
          <button type="button" onClick={onClose} className="btn-ghost text-sm" disabled={busy}>
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || !raw.trim()}
            className="btn-primary text-sm"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            Import
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
