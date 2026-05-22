import { useEffect, useState, useCallback } from 'react';
import { Lock, Unlock, Search, Loader2, ShieldCheck } from 'lucide-react';
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/adminService';
import { useAuthStore } from '@/store/authStore';

export default function ManageUsers() {
  const currentUserId = useAuthStore((s) => s.user?._id);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ role: 'all', isActive: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filters.role !== 'all') params.role = filters.role;
        if (filters.isActive !== 'all') params.isActive = filters.isActive === 'true';
        if (filters.search) params.search = filters.search;
        const res = await adminService.listUsers(params);
        setItems(res.data.items);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput }));
  };

  const handleToggleLock = async () => {
    if (!confirmTarget) return;
    setBusy(true);
    try {
      await adminService.toggleUserLock(confirmTarget._id, !confirmTarget.isActive);
      setConfirmTarget(null);
      await fetchUsers(pagination.page);
    } catch (err) {
      alert(err?.message || 'Thao tác thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-slate-900">Quản lý người dùng</h1>
          <p className="text-sm text-slate-600 mt-1">
            Xem danh sách, lọc theo vai trò/trạng thái, và khóa/mở khóa tài khoản.
          </p>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <form onSubmit={handleSearch} className="flex-1 min-w-[240px]">
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tên hoặc email…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Vai trò</label>
                <Select
                  value={filters.role}
                  onValueChange={(v) => setFilters((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Trạng thái</label>
                <Select
                  value={filters.isActive}
                  onValueChange={(v) => setFilters((f) => ({ ...f, isActive: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Đã khóa</SelectItem>
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
                Không có người dùng nào khớp bộ lọc.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Mục tiêu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tham gia</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((u) => {
                    const isSelf = String(u._id) === String(currentUserId);
                    return (
                      <TableRow key={u._id}>
                        <TableCell>
                          <p className="text-sm font-medium">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </TableCell>
                        <TableCell>
                          {u.role === 'admin' ? (
                            <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="muted">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{u.targetScore}</TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                              Hoạt động
                            </Badge>
                          ) : (
                            <Badge className="bg-tertiary-100 text-tertiary-700 border-tertiary-200">
                              Đã khóa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-slate-400 italic">Bạn</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmTarget(u)}
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                                u.isActive
                                  ? 'border-tertiary-200 text-tertiary-700 hover:bg-tertiary-50'
                                  : 'border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                              }`}
                            >
                              {u.isActive ? (
                                <>
                                  <Lock className="w-3 h-3" /> Khóa
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3" /> Mở khóa
                                </>
                              )}
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {pagination.total} người dùng • Trang {pagination.page}/{pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="btn-ghost text-sm"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="btn-ghost text-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.isActive
                ? `Người dùng ${confirmTarget?.fullName} (${confirmTarget?.email}) sẽ không đăng nhập được nữa cho đến khi mở khóa.`
                : `Mở khóa tài khoản ${confirmTarget?.fullName} (${confirmTarget?.email}).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmTarget(null)}
              className="btn-ghost text-sm"
              disabled={busy}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleToggleLock}
              disabled={busy}
              className={`btn text-sm text-white ${
                confirmTarget?.isActive
                  ? 'bg-tertiary-500 hover:bg-tertiary-600'
                  : 'bg-secondary-500 hover:bg-secondary-600'
              }`}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {confirmTarget?.isActive ? 'Khóa' : 'Mở khóa'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
