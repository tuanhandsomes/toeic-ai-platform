import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { StatusBanner } from '@/components/common/StatusBanner';
import PasswordChecklist from '@/components/common/PasswordChecklist';
import PasswordInput from '@/components/common/PasswordInput';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { ROUTES } from '@/constants/routes';
import { isValidPassword } from '@/utils/passwordRules';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);
  const logout = useAuthStore((s) => s.logout);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    targetScore: user?.targetScore || 700,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Modal hiện sau khi đổi mật khẩu thành công → user phải đăng nhập lại.
  // Có countdown 5s tự động redirect, user có thể bấm nút để đi ngay.
  const [postChangeOpen, setPostChangeOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Khi modal mở → đếm ngược 5s → tự logout + redirect login
  useEffect(() => {
    if (!postChangeOpen) return;
    setRedirectCountdown(5);
    const tick = setInterval(() => {
      setRedirectCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
          // logout + redirect ngay khi tới 0
          logout().then(() => navigate(ROUTES.LOGIN));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [postChangeOpen, logout, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus(null);
    setSavingProfile(true);
    try {
      // Admin không có field targetScore → chỉ gửi fullName
      const payload =
        user?.role === 'admin'
          ? { fullName: profileForm.fullName }
          : profileForm;
      await userService.updateProfile(payload);
      await loadUser();
      setProfileStatus({ variant: 'success', message: 'Cập nhật thông tin thành công' });
    } catch (err) {
      setProfileStatus({ variant: 'error', message: err?.message || 'Lưu thất bại' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ variant: 'error', message: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (!isValidPassword(passwordForm.newPassword)) {
      setPasswordStatus({
        variant: 'error',
        message: 'Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.',
      });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // BE đã revoke refresh tokens. FE cần ép logout + redirect — access token
      // hiện tại vẫn hợp lệ ~15 phút nên user phải đăng nhập lại với mật khẩu mới.
      setPostChangeOpen(true);
    } catch (err) {
      setPasswordStatus({ variant: 'error', message: err?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleConfirmReLogin = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  // Admin xem Profile trong AdminLayout (không lộ sidebar user app),
  // user thường xem trong AppLayout như cũ.
  const Layout = user?.role === 'admin' ? AdminLayout : AppLayout;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Hồ sơ cá nhân</h1>
          <p className="text-slate-600">Quản lý thông tin tài khoản và bảo mật.</p>
        </div>

        {/* Profile info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật họ tên và mục tiêu điểm.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.fullName}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <Badge variant="muted" className="mt-1">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} readOnly className="bg-slate-50" />
                <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
              </div>

              {/* Admin không làm bài thi → không cần mục tiêu điểm */}
              {user?.role !== 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="targetScore">Mục tiêu điểm TOEIC</Label>
                  <Select
                    value={String(profileForm.targetScore)}
                    onValueChange={(v) => setProfileForm({ ...profileForm, targetScore: Number(v) })}
                  >
                    <SelectTrigger id="targetScore">
                      <SelectValue placeholder="Chọn mục tiêu" />
                    </SelectTrigger>
                    <SelectContent>
                      {[500, 600, 700, 750, 800, 850, 900, 990].map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          {s} điểm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {profileStatus && <StatusBanner {...profileStatus} />}

              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Cập nhật mật khẩu định kỳ để bảo mật tài khoản.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <PasswordInput
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  minLength={8}
                  maxLength={72}
                  required
                />
                <PasswordChecklist value={passwordForm.newPassword} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              {passwordStatus && <StatusBanner {...passwordStatus} />}

              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal bắt buộc đăng nhập lại sau khi đổi mật khẩu thành công.
          Không cho đóng bằng overlay/ESC — phải bấm nút "Đăng nhập lại". */}
      <Dialog
        open={postChangeOpen}
        onOpenChange={() => {
          /* chặn đóng — buộc bấm nút bên dưới */
        }}
      >
        <DialogContent
          className="max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu thành công</DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              Mật khẩu của bạn đã được cập nhật. Để đảm bảo an toàn, hệ thống sẽ
              đăng xuất khỏi tất cả thiết bị. Tự động chuyển về trang đăng nhập
              sau{' '}
              <span className="font-semibold text-slate-900">
                {redirectCountdown}s
              </span>
              …
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={handleConfirmReLogin}
              className="btn-primary text-sm"
            >
              Đăng nhập lại ngay
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
