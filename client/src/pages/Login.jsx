import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Flame,
  Headphones,
  BadgeCheck,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { ROUTES } from "../constants/routes.js";
import PasswordInput from "../components/common/PasswordInput.jsx";

// Message tiếng Việt cho các lý do redirect về login từ axios interceptor
const REASON_MESSAGES = {
  "session-expired":
    "Phiên đăng nhập của bạn đã kết thúc. Vui lòng đăng nhập lại để tiếp tục.",
};

function PromoPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-10 xl:p-12 flex-col items-center justify-center relative overflow-hidden">
      {/* Logo (absolute top-left) */}
      <div className="absolute top-10 left-10 xl:top-12 xl:left-12 flex items-center gap-2.5 z-10">
        <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-xl font-heading font-bold">TOEIC AI</span>
      </div>

      {/* Hero copy + visual + testimonial — centered both axes */}
      <div className="relative z-10 w-full max-w-lg">
        <h1 className="text-5xl xl:text-6xl font-heading font-bold mb-4 leading-tight whitespace-nowrap">
          Chào mừng trở lại!
        </h1>
        <p className="text-base xl:text-lg text-primary-100 leading-relaxed mb-10">
          Hãy tiếp tục chuỗi học tập của bạn. Hệ thống AI đã sẵn sàng với bộ đề
          mới dựa trên kỹ năng của bạn.
        </p>

        {/* Mock visual card */}
        <div className="relative w-full max-w-md">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 aspect-[4/3] overflow-hidden shadow-elevated flex items-center justify-center relative">
            {/* Decorative dots/lines simulating dashboard */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-6 left-6 w-12 h-1 rounded-full bg-emerald-400" />
              <div className="absolute top-10 left-6 w-8 h-1 rounded-full bg-blue-400" />
              <div className="absolute top-6 right-6 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-1.5 h-12">
                {[40, 65, 50, 80, 35, 70, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary-400/40 to-primary-300/60"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center relative z-10">
              <Headphones className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Floating: predicted score */}
          <div className="absolute -top-3 -left-3 bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
            <div className="flex items-center gap-1.5 text-[10px] text-primary-100 mb-0.5">
              <TrendingUp className="w-3 h-3" /> Điểm dự kiến
            </div>
            <p className="text-xl font-heading font-bold leading-none">845</p>
          </div>

          {/* Floating: streak */}
          <div className="absolute -bottom-3 -right-3 bg-white/15 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="text-[10px] text-primary-100 leading-tight">
                5 NGÀY LIÊN TIẾP
              </p>
              <div className="flex gap-0.5 mt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="w-1 h-2 rounded-sm bg-amber-300" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-10 rounded-xl bg-white/10 backdrop-blur border border-white/15 p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <p className="text-sm text-primary-50 leading-relaxed">
            "Lộ trình học AI giúp tôi tăng từ 550 lên 820 chỉ trong 2 tháng.
            Những gợi ý sửa lỗi rất chi tiết!"
            <br />
            <span className="text-primary-200">
              — Hoàng Anh, Software Engineer
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const reason = searchParams.get("reason");
  const reasonMessage = reason ? REASON_MESSAGES[reason] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form);
      navigate(user?.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD);
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại");
    }
  };

  const clearReason = () => {
    if (reason) {
      searchParams.delete("reason");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <PromoPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-elevated border border-slate-100 p-7 sm:p-8">
          {/* Mobile logo */}
          <div className="mb-6 lg:hidden flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-heading font-bold">TOEIC AI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mb-1.5">
            Đăng nhập
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Tiếp tục hành trình luyện TOEIC của bạn
          </p>

          {reasonMessage && !error && (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
              <span>{reasonMessage}</span>
            </div>
          )}

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
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => {
                    clearReason();
                    setForm({ ...form, email: e.target.value });
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="label">Mật khẩu</label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <PasswordInput
                native
                leftIcon={
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                }
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => {
                  clearReason();
                  setForm({ ...form, password: e.target.value });
                }}
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Ghi nhớ đăng nhập trong 30 ngày
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isLoading ? (
                "Đang đăng nhập..."
              ) : (
                <>
                  Đăng nhập <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              to={ROUTES.REGISTER}
              className="text-primary-600 font-medium hover:underline"
            >
              Đăng ký
            </Link>
          </p>

          {/* Streak nudge card */}
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                Bạn đã học liên tiếp 5 ngày!
              </p>
              <p className="text-xs text-slate-600">
                Đăng nhập để duy trì chuỗi và nhận quà tặng từ AI.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
