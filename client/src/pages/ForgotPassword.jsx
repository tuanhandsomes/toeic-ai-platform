import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailQuestion, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/60 via-white to-primary-50/40 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-elevated border border-slate-100 p-7 sm:p-8">
        {/* Top row: brand + back link */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-base font-heading font-bold text-primary-600">
            TOEIC AI
          </span>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>

        {/* Icon + title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <MailQuestion className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">
            Quên mật khẩu?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-secondary-50 border border-secondary-100 text-secondary-700 px-4 py-4 text-sm flex gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Đã gửi yêu cầu</p>
              <p className="mt-1 text-secondary-700/80">
                Nếu email <strong>{email}</strong> đã được đăng ký, chúng tôi
                đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư
                (cả thư rác).
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
                    placeholder="username@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
          Gặp khó khăn?{' '}
          <a
            href="mailto:support@toeicai.vn"
            className="text-primary-600 font-medium hover:underline"
          >
            Liên hệ bộ phận hỗ trợ
          </a>
        </div>
      </div>
    </div>
  );
}
