import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { ROUTES } from '../constants/routes.js';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại');
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
          <h1 className="text-4xl font-heading font-bold mb-4">Chào mừng trở lại!</h1>
          <p className="text-primary-100 text-lg">
            Tiếp tục hành trình chinh phục mục tiêu TOEIC với AI phân tích cá nhân hóa.
          </p>
        </div>
        <p className="text-primary-200 text-sm">
          "AI phân tích chỉ ra Part 5 mình yếu, mình tăng 100 điểm trong 2 tháng."
          <br />— Nguyễn Minh Anh, 805 TOEIC
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-heading font-bold">TOEIC AI</span>
          </div>

          <h2 className="text-3xl font-heading font-bold mb-2">Đăng nhập</h2>
          <p className="text-slate-600 mb-8">Tiếp tục hành trình luyện TOEIC của bạn</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="ban@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="label">Mật khẩu</label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary-500 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
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

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-500 font-medium hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
