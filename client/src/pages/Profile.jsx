import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import PasswordChecklist from '@/components/common/PasswordChecklist';
import PasswordInput from '@/components/common/PasswordInput';
import TargetScoreSelect from '@/components/common/TargetScoreSelect';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { ROUTES } from '@/constants/routes';
import { isValidPassword } from '@/utils/passwordRules';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'profile', label: 'Hồ sơ' },
  { id: 'password', label: 'Mật khẩu' },
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);
  const logout = useAuthStore((s) => s.logout);

  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    targetScore: user?.targetScore || 700,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const isProfileDirty =
    profileForm.fullName !== (user?.fullName || '') ||
    (user?.role !== 'admin' &&
      profileForm.targetScore !== (user?.targetScore || 700));

  // Modal hiện sau khi đổi mật khẩu thành công → user phải đăng nhập lại.
  // Có countdown 5s tự động redirect, user có thể bấm nút để đi ngay.
  const [postChangeOpen, setPostChangeOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    if (!postChangeOpen) return;
    setRedirectCountdown(5);
    const tick = setInterval(() => {
      setRedirectCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
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
    setSavingProfile(true);
    try {
      const payload =
        user?.role === 'admin'
          ? { fullName: profileForm.fullName }
          : profileForm;
      await userService.updateProfile(payload);
      await loadUser();
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      toast.error(err?.message || 'Lưu thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!isValidPassword(passwordForm.newPassword)) {
      toast.error('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.');
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPostChangeOpen(true);
    } catch (err) {
      toast.error(err?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleConfirmReLogin = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const Layout = user?.role === 'admin' ? AdminLayout : AppLayout;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2 text-slate-900">
            Cài đặt tài khoản
          </h1>
          <p className="text-slate-600">
            Bạn có thể quản lý thông tin hồ sơ và mật khẩu của mình.
          </p>
        </div>

        <hr className="border-slate-200 mb-8" />

        {/* 2-col: sidebar tabs + content */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
          {/* Sidebar tabs */}
          <nav className="flex md:flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'text-left px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div>
            {activeTab === 'profile' && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-1 text-slate-900">
                  Hồ sơ
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Đây là thông tin hồ sơ cá nhân của bạn.
                </p>
                <hr className="border-slate-200 mb-6" />

                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fullName: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-slate-500">
                      Tên này sẽ được dùng làm tên hiển thị.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Địa chỉ email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
                  </div>

                  {user?.role !== 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="targetScore">Mục tiêu điểm TOEIC</Label>
                      <TargetScoreSelect
                        value={profileForm.targetScore}
                        onChange={(v) =>
                          setProfileForm({ ...profileForm, targetScore: v })
                        }
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile || !isProfileDirty}
                      className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'password' && (
              <section>
                <h2 className="text-xl font-heading font-bold mb-1 text-slate-900">
                  Mật khẩu
                </h2>
                <p className="text-sm text-slate-600 mb-5">
                  Bạn có thể thay đổi mật khẩu tài khoản của mình.
                </p>
                <hr className="border-slate-200 mb-6" />

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <PasswordInput
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
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
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
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
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
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
