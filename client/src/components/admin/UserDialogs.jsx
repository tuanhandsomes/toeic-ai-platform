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
import PasswordChecklist from '@/components/common/PasswordChecklist';
import PasswordInput from '@/components/common/PasswordInput';
import { isValidPassword } from '@/utils/passwordRules';

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
    if (isCreate && !isValidPassword(form.password)) {
      setErr('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
      return;
    }
    setBusy(true);
    try {
      // Đọc fullName từ FormData vì field này uncontrolled (defaultValue + name)
      // để tránh bug controlled input "ăn" ký tự khi gõ tiếng Việt có dấu.
      const fd = new FormData(e.currentTarget);
      const payload = {
        fullName: (fd.get('fullName') || '').toString().trim(),
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
            name="fullName"
            required
            minLength={2}
            maxLength={100}
            defaultValue={isCreate ? '' : initialUser?.fullName || ''}
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
            <PasswordInput
              id="password"
              required
              minLength={8}
              maxLength={72}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
            />
            <PasswordChecklist value={form.password} />
          </div>
        )}

        {/* Admin không làm bài thi nên không cần mục tiêu điểm — chỉ hiện cho user */}
        <div className={form.role === 'admin' ? '' : 'grid grid-cols-2 gap-3'}>
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
          {form.role !== 'admin' && (
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
          )}
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
    if (!isValidPassword(password)) {
      setErr('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
      return;
    }
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
          <PasswordInput
            id="newPassword"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordChecklist value={password} />
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
