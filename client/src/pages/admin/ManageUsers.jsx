import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Unlock,
  Search,
  Loader2,
  ShieldCheck,
  MoreHorizontal,
  Plus,
  Pencil,
  KeyRound,
  Trash2,
  Eye,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserFormDialog,
  ResetPasswordDialog,
  DeleteUserDialog,
} from "@/components/admin/UserDialogs";
import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function ManageUsers() {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?._id);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  // `filters` = committed filters dùng để fetch. `pending` = UI state khi user
  // đang chỉnh dropdown/search input nhưng CHƯA bấm "Tìm". Chỉ apply khi submit.
  const INITIAL_FILTERS = { role: "all", isActive: "all", search: "" };
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pending, setPending] = useState(INITIAL_FILTERS);

  // Dialog states
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: "create",
    user: null,
  });
  const [lockTarget, setLockTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lockBusy, setLockBusy] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (filters.role !== "all") params.role = filters.role;
        if (filters.isActive !== "all")
          params.isActive = filters.isActive === "true";
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
    if (e) e.preventDefault();
    setFilters(pending);
  };

  const handleResetFilters = () => {
    setPending(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
  };

  // Lưu ý: handleCreate/Edit/ResetPassword được gọi từ Dialog children — Dialog
  // tự handle error UI bằng cách show error trong form, KHÔNG cần toast error.
  // Chỉ toast khi THÀNH CÔNG để FE bắt được + dialog đóng.
  const handleCreate = async (payload) => {
    const res = await adminService.createUser(payload);
    setFormDialog({ open: false, mode: "create", user: null });
    await fetchUsers(1);
    toast.success(`Đã tạo người dùng "${res.data.user.fullName}"`);
  };

  const handleEdit = async (payload) => {
    const target = formDialog.user;
    await adminService.updateUser(target._id, payload);
    setFormDialog({ open: false, mode: "create", user: null });
    await fetchUsers(pagination.page);
    toast.success(`Đã cập nhật thông tin "${target.fullName}"`);
  };

  const handleResetPassword = async (newPassword) => {
    const target = resetTarget;
    await adminService.resetUserPassword(target._id, newPassword);
    setResetTarget(null);
    toast.success(
      `Đã đặt lại mật khẩu cho "${target.fullName}". Người dùng đã bị đăng xuất khỏi mọi thiết bị.`,
    );
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    await adminService.deleteUser(target._id);
    setDeleteTarget(null);
    // Nếu xóa user cuối trang hiện tại, lùi về trang trước
    const remaining = items.length - 1;
    const nextPage =
      remaining === 0 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page;
    await fetchUsers(nextPage);
    toast.success(`Đã xóa người dùng "${target.fullName}"`);
  };

  const handleToggleLock = async () => {
    if (!lockTarget) return;
    const target = lockTarget;
    const willLock = target.isActive; // toggle: nếu đang active thì thao tác là KHÓA
    setLockBusy(true);
    try {
      await adminService.toggleUserLock(target._id, !target.isActive);
      setLockTarget(null);
      await fetchUsers(pagination.page);
      toast.success(
        willLock
          ? `Đã khóa tài khoản "${target.fullName}". Mọi phiên đăng nhập của người này đã bị thu hồi.`
          : `Đã mở khóa tài khoản "${target.fullName}".`,
      );
    } catch (err) {
      toast.error(err?.message || "Thao tác thất bại");
    } finally {
      setLockBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900">
              Quản lý người dùng
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tạo, sửa, xóa, khóa/mở khóa và đặt lại mật khẩu cho tài khoản.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormDialog({ open: true, mode: "create", user: null })
            }
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" /> Tạo người dùng
          </button>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tên hoặc email…"
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
                  Vai trò
                </label>
                <Select
                  value={pending.role}
                  onValueChange={(v) =>
                    setPending((p) => ({ ...p, role: v }))
                  }
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
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Trạng thái
                </label>
                <Select
                  value={pending.isActive}
                  onValueChange={(v) =>
                    setPending((p) => ({ ...p, isActive: v }))
                  }
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

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary text-sm"
                >
                  <Search className="w-4 h-4" /> Tìm
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-ghost text-sm"
                >
                  Đặt lại
                </button>
              </div>
            </form>
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
                          {u.role === "admin" ? (
                            <p className="text-sm font-medium text-slate-900">
                              {u.fullName}
                            </p>
                          ) : (
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="text-sm font-medium text-slate-900 hover:text-primary-600 hover:underline"
                            >
                              {u.fullName}
                            </Link>
                          )}
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </TableCell>
                        <TableCell>
                          {u.role === "admin" ? (
                            <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                            </Badge>
                          ) : (
                            <Badge variant="muted">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {u.role === 'admin' ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            u.targetScore
                          )}
                        </TableCell>
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
                          {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          {isSelf ? (
                            <span className="text-xs text-slate-400 italic">
                              Bạn
                            </span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-slate-100 text-slate-600"
                                  aria-label="Hành động"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {u.role !== "admin" && (
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      navigate(`/admin/users/${u._id}`)
                                    }
                                  >
                                    <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setFormDialog({
                                      open: true,
                                      mode: "edit",
                                      user: u,
                                    })
                                  }
                                >
                                  <Pencil className="w-4 h-4 mr-2" /> Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setResetTarget(u)}
                                >
                                  <KeyRound className="w-4 h-4 mr-2" /> Đặt lại
                                  mật khẩu
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setLockTarget(u)}
                                >
                                  {u.isActive ? (
                                    <>
                                      <Lock className="w-4 h-4 mr-2" /> Khóa
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-4 h-4 mr-2" /> Mở
                                      khóa
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={() => setDeleteTarget(u)}
                                  className="text-tertiary-700 focus:text-tertiary-700 focus:bg-tertiary-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                />
              </PaginationItem>
              {getPageRange(pagination.page, pagination.totalPages).map(
                (p, idx) => (
                  <PaginationItem key={`${p}-${idx}`}>
                    {p === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={p === pagination.page}
                        onClick={() => fetchUsers(p)}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <UserFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        initialUser={formDialog.user}
        onClose={() =>
          setFormDialog({ open: false, mode: "create", user: null })
        }
        onSubmit={formDialog.mode === "create" ? handleCreate : handleEdit}
      />

      <ResetPasswordDialog
        open={!!resetTarget}
        user={resetTarget}
        onClose={() => setResetTarget(null)}
        onSubmit={handleResetPassword}
      />

      <DeleteUserDialog
        open={!!deleteTarget}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Dialog
        open={!!lockTarget}
        onOpenChange={(open) => !open && setLockTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lockTarget?.isActive ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </DialogTitle>
            <DialogDescription>
              {lockTarget?.isActive
                ? `Người dùng ${lockTarget?.fullName} (${lockTarget?.email}) sẽ không đăng nhập được nữa cho đến khi được mở khóa.`
                : `Mở khóa tài khoản ${lockTarget?.fullName} (${lockTarget?.email}).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setLockTarget(null)}
              className="btn-ghost text-sm"
              disabled={lockBusy}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleToggleLock}
              disabled={lockBusy}
              className={`btn text-sm text-white ${
                lockTarget?.isActive
                  ? "bg-tertiary-500 hover:bg-tertiary-600"
                  : "bg-secondary-500 hover:bg-secondary-600"
              }`}
            >
              {lockBusy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              {lockTarget?.isActive ? "Khóa" : "Mở khóa"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
