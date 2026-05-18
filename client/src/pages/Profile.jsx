import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StatusBanner } from '@/components/common/StatusBanner';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus(null);
    setSavingProfile(true);
    try {
      await userService.updateProfile(profileForm);
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
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ variant: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus({ variant: 'success', message: 'Đổi mật khẩu thành công' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus({ variant: 'error', message: err?.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AppLayout>
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
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  minLength={6}
                  required
                />
                <p className="text-xs text-slate-500">Tối thiểu 6 ký tự.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
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
    </AppLayout>
  );
}
