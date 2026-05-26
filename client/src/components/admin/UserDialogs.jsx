import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

/**
 * Pattern: state-holding form là child component được render bên trong DialogContent.
 * Khi Dialog đóng, Radix unmount DialogContent → form state reset tự nhiên,
 * không cần useEffect để reset.
 */

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'user',
  targetScore: 700,
};

function UserForm({ mode, initialUser, onClose, onSubmit }) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState(() =>
    isCreate
      ? emptyForm
      : {
          fullName: initialUser?.fullName || '',
          email: initialUser?.email || '',
          password: '',
          role: initialUser?.role || 'user',
          targetScore: initialUser?.targetScore ?? 700,
        },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        targetScore: Number(form.targetScore),
      };
      if (isCreate) payload.password = form.password;
      await onSubmit(payload);
    } catch (e2) {
      setErr(e2?.message || 'Thao tác thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isCreate ? 'Tạo người dùng' : 'Sửa người dùng'}</DialogTitle>
        <DialogDescription>
          {isCreate
            ? 'Tạo tài khoản mới. Người dùng có thể đăng nhập ngay với mật khẩu này.'
            : 'Cập nhật thông tin. Đổi vai trò sẽ buộc người dùng đăng nhập lại.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Họ tên</Label>
          <Input
            id="fullName"
            required
            minLength={2}
            maxLength={100}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </div>

        {isCreate && (
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              maxLength={72}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="role">Vai trò</Label>
            <Select value={form.role} onValueChange={(v) => setField('role', v)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="targetScore">Mục tiêu điểm</Label>
            <Input
              id="targetScore"
              type="number"
              min={10}
              max={990}
              required
              value={form.targetScore}
              onChange={(e) => setField('targetScore', e.target.value)}
            />
          </div>
        </div>

        {err && (
          <p className="text-sm text-tertiary-700 bg-tertiary-50 border border-tertiary-200 rounded-md px-3 py-2">
            {err}
          </p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn text-sm text-white bg-primary-500 hover:bg-primary-600"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            {isCreate ? 'Tạo' : 'Lưu'}
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function UserFormDialog({ open, mode, initialUser, onClose, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {open && (
          <UserForm
            mode={mode}
            initialUser={initialUser}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordForm({ user, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await onSubmit(password);
    } catch (e2) {
      setErr(e2?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Đặt lại mật khẩu</DialogTitle>
        <DialogDescription>
          Đặt mật khẩu mới cho{' '}
          <span className="font-medium">{user?.fullName}</span> ({user?.email}).
          Người dùng sẽ bị đăng xuất ở mọi thiết bị.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input
            id="newPassword"
            type="password"
            required
            minLength={6}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự.</p>
        </div>

        {err && (
          <p className="text-sm text-tertiary-700 bg-tertiary-50 border border-tertiary-200 rounded-md px-3 py-2">
            {err}
          </p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn text-sm text-white bg-primary-500 hover:bg-primary-600"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
            Đặt lại
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ResetPasswordDialog({ open, user, onClose, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {open && <ResetPasswordForm user={user} onClose={onClose} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserBody({ user, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleConfirm = async () => {
    setErr('');
    setBusy(true);
    try {
      await onConfirm();
    } catch (e2) {
      setErr(e2?.message || 'Xóa người dùng thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Xóa người dùng?</DialogTitle>
        <DialogDescription>
          Hành động này sẽ xóa vĩnh viễn{' '}
          <span className="font-medium">{user?.fullName}</span> ({user?.email})
          cùng toàn bộ lịch sử làm bài và phân tích AI của người này. Không thể hoàn tác.
        </DialogDescription>
      </DialogHeader>

      {err && (
        <p className="text-sm text-tertiary-700 bg-tertiary-50 border border-tertiary-200 rounded-md px-3 py-2">
          {err}
        </p>
      )}

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="btn-ghost text-sm"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="btn text-sm text-white bg-tertiary-500 hover:bg-tertiary-600"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
          Xóa vĩnh viễn
        </button>
      </DialogFooter>
    </>
  );
}

export function DeleteUserDialog({ open, user, onClose, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {open && <DeleteUserBody user={user} onClose={onClose} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}
