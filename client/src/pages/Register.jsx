import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  Award,
  GraduationCap,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { ROUTES } from "../constants/routes.js";
import PasswordChecklist from "../components/common/PasswordChecklist.jsx";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { isValidPassword } from "../utils/passwordRules.js";

const FEATURE_PILLS = [
  { icon: Sparkles, label: "Lộ trình AI" },
  { icon: BarChart3, label: "Phân tích sâu" },
  { icon: Award, label: "Đề thi thật" },
];

function PromoPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 via-white to-primary-50/40 p-10 xl:p-14 flex-col items-center justify-center">
      <div className="w-full max-w-md">
        {/* Poster card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 shadow-elevated text-white mb-5">
          {/* Mock window */}
          <div className="rounded-xl bg-white p-5 mb-5 aspect-[5/4] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
              <div className="flex gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-slate-300" />
                <span className="w-3 h-0.5 rounded-full bg-slate-300" />
              </div>
            </div>

            {/* Center: graduation icon + 4 dot-avatars */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <GraduationCap className="w-9 h-9 text-primary-700" />
              </div>
              <div className="flex -space-x-2">
                {[
                  "from-pink-300 to-pink-500",
                  "from-amber-300 to-amber-500",
                  "from-emerald-300 to-emerald-500",
                  "from-violet-300 to-violet-500",
                ].map((g, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative bottom row */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-slate-400 font-mono">
                TOEIC AI
              </span>
              <div className="flex gap-1">
                <span className="w-6 h-1 rounded-full bg-primary-100" />
                <span className="w-3 h-1 rounded-full bg-secondary-100" />
                <span className="w-2 h-1 rounded-full bg-amber-100" />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-heading font-bold mb-2 leading-snug">
            Bắt đầu hành trình chinh phục{" "}
            <span className="text-amber-300">990 TOEIC</span>
          </h3>
          <p className="text-sm text-primary-100 leading-relaxed">
            Lộ trình cá nhân hóa dựa trên AI giúp bạn đạt mục tiêu nhanh hơn 40%
            so với phương pháp truyền thống.
          </p>
        </div>

        {/* 3 feature pills */}
        <div className="grid grid-cols-3 gap-3">
          {FEATURE_PILLS.map((p) => (
            <div
              key={p.label}
              className="rounded-xl bg-white border border-slate-100 p-3 flex flex-col items-center gap-1.5 shadow-card hover:-translate-y-0.5 hover:shadow-elevated transition-all"
            >
              <p.icon className="w-5 h-5 text-primary-600" />
              <span className="text-xs font-medium text-slate-700 text-center">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    targetScore: 700,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidPassword(form.password)) {
      setError(
        "Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.",
      );
      return;
    }
    try {
      await register(form);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <PromoPanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-elevated border border-slate-100 p-7 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-2 text-primary-700">
            Tạo tài khoản
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Tham gia cùng hơn{" "}
            <strong className="text-slate-900">10.000+ học viên</strong> đang
            luyện thi mỗi ngày.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Nhập tên của bạn"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
              <label className="label">Mật khẩu</label>
              <PasswordInput
                native
                leftIcon={
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                }
                placeholder="********"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                maxLength={72}
                required
              />
              <PasswordChecklist value={form.password} />
            </div>

            <div>
              <label className="label">Mục tiêu điểm TOEIC</label>
              <div className="relative">
                <Target className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <select
                  className="input pl-10"
                  value={form.targetScore}
                  onChange={(e) =>
                    setForm({ ...form, targetScore: Number(e.target.value) })
                  }
                >
                  <option value={500}>500</option>
                  <option value={600}>600</option>
                  <option value={700}>700</option>
                  <option value={800}>800</option>
                  <option value={900}>900</option>
                  <option value={990}>990</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-1">Có thể thay đổi sau</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isLoading ? (
                "Đang đăng ký..."
              ) : (
                <>
                  Đăng ký ngay <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary-600 font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
