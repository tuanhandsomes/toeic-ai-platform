import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Sparkles, ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import { ROUTES } from '../constants/routes.js';

const TOKEN_FORMAT = /^[a-f0-9]{64}$/i;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  // 'checking' → loading verify, 'valid' → show form, 'invalid' → show error UI
  const [tokenStatus, setTokenStatus] = useState(
    TOKEN_FORMAT.test(token) ? 'checking' : 'invalid',
  );
  const [tokenError, setTokenError] = useState('');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Verify token validity on mount so user sees expired/invalid state BEFORE
  // filling the form. BE endpoint is idempotent — does not consume the token.
  useEffect(() => {
    if (tokenStatus !== 'checking') return;
    let cancelled = false;
    authService
      .verifyResetToken(token)
      .then(() => {
        if (!cancelled) setTokenStatus('valid');
      })
      .catch((err) => {
        if (cancelled) return;
        setTokenError(err?.message || 'Liên kết không hợp lệ');
        setTokenStatus('invalid');
      });
    return () => {
      cancelled = true;
    };
  }, [token, tokenStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setDone(true);
      // Redirect about 2s sau cho user kịp đọc message
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      setError(err?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          <span className="text-2xl font-heading font-bold">TOEIC AI</span>
        </div>
        <div>
          <h1 className="text-4xl font-heading font-bold mb-4">Đặt mật khẩu mới</h1>
          <p className="text-primary-100 text-lg">
            Chọn một mật khẩu mạnh, dễ nhớ. Sau khi đổi, mọi phiên đăng nhập cũ sẽ tự đăng xuất.
          </p>
        </div>
        <p className="text-primary-200 text-sm">Liên kết chỉ dùng được 1 lần.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>

          <h2 className="text-3xl font-heading font-bold mb-2">Đặt lại mật khẩu</h2>
          <p className="text-slate-600 mb-8">Nhập mật khẩu mới cho tài khoản của bạn.</p>

          {done ? (
            <div className="rounded-lg bg-secondary-50 border border-secondary-100 text-secondary-700 px-4 py-4 text-sm flex gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Đặt lại mật khẩu thành công</p>
                <p className="mt-1">Đang chuyển về trang đăng nhập...</p>
              </div>
            </div>
          ) : tokenStatus === 'checking' ? (
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang kiểm tra liên kết...
            </div>
          ) : tokenStatus === 'invalid' ? (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-4 text-sm flex gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Liên kết không hợp lệ hoặc đã hết hạn</p>
                <p className="mt-1 text-red-700/80">
                  {tokenError || 'Vui lòng yêu cầu liên kết mới.'}
                </p>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="mt-3 inline-flex items-center gap-1 text-primary-500 font-medium hover:underline"
                >
                  Gửi lại yêu cầu đặt lại mật khẩu →
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pl-10 pr-10"
                      placeholder="Ít nhất 6 ký tự"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pl-10"
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
