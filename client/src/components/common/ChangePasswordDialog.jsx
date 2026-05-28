import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordChecklist from '@/components/common/PasswordChecklist';
import PasswordInput from '@/components/common/PasswordInput';
import { isValidPassword } from '@/utils/passwordRules';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

const INITIAL = { currentPassword: '', newPassword: '', confirm: '' };

export default function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    if (busy) return;
    setForm(INITIAL);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!isValidPassword(form.newPassword)) {
      setError('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
      return;
    }
    setBusy(true);
    try {
      await userService.changePassword(form.currentPassword, form.newPassword);
      toast.success('Đổi mật khẩu thành công');
      setForm(INITIAL);
      onClose();
    } catch (err) {
      setError(err?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới. Mọi phiên đăng nhập khác sẽ
            tự đăng xuất sau khi đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label>Mật khẩu hiện tại</Label>
            <PasswordInput
              native
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Label>Mật khẩu mới</Label>
            <PasswordInput
              native
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              placeholder="••••••••"
              required
              minLength={8}
              maxLength={72}
            />
            <PasswordChecklist value={form.newPassword} />
          </div>

          <div>
            <Label>Xác nhận mật khẩu mới</Label>
            <Input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary text-sm"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Đổi mật khẩu
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
