import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Target, Sparkles, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { ROUTES } from "../constants/routes.js";
import PasswordChecklist from "../components/common/PasswordChecklist.jsx";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { isValidPassword } from "../utils/passwordRules.js";

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          <span className="text-2xl font-heading font-bold">TOEIC AI</span>
        </div>
        <div>
          <h1 className="text-4xl font-heading font-bold mb-4">
            Mỗi câu trả lời đúng là một bước tiến gần hơn đến mục tiêu.
          </h1>
          <p className="text-primary-100 text-lg">
            Tham gia cùng 10.000+ học viên đang luyện TOEIC.
          </p>
        </div>
        <div />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-heading font-bold mb-2">
            Tạo tài khoản miễn phí
          </h2>
          <p className="text-slate-600 mb-8">
            Bắt đầu hành trình chinh phục TOEIC trong 30 giây
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
                  placeholder="Nguyễn Văn A"
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
              className="btn-primary w-full"
            >
              {isLoading ? (
                "Đang đăng ký..."
              ) : (
                <>
                  Đăng ký <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="text-primary-500 font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
