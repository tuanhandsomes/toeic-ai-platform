import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService.js';
import { ROUTES } from '../constants/routes.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Gửi yêu cầu thất bại');
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
          <h1 className="text-4xl font-heading font-bold mb-4">Quên mật khẩu?</h1>
          <p className="text-primary-100 text-lg">
            Đừng lo — nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu trong vài
            giây.
          </p>
        </div>
        <p className="text-primary-200 text-sm">Liên kết có hiệu lực 30 phút.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>

          <h2 className="text-3xl font-heading font-bold mb-2">Quên mật khẩu</h2>
          <p className="text-slate-600 mb-8">
            Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
          </p>

          {sent ? (
            <div className="rounded-lg bg-secondary-50 border border-secondary-100 text-secondary-700 px-4 py-4 text-sm flex gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Đã gửi yêu cầu</p>
                <p className="mt-1 text-secondary-700/80">
                  Nếu email <strong>{email}</strong> đã được đăng ký, chúng tôi đã gửi liên kết đặt
                  lại mật khẩu. Vui lòng kiểm tra hộp thư (cả thư rác).
                </p>
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
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="ban@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
