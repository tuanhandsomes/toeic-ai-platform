import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { authService } from "../services/authService.js";
import { ROUTES } from "../constants/routes.js";
import PasswordChecklist from "../components/common/PasswordChecklist.jsx";
import PasswordInput from "../components/common/PasswordInput.jsx";
import { isValidPassword } from "../utils/passwordRules.js";

const TOKEN_FORMAT = /^[a-f0-9]{64}$/i;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [tokenStatus, setTokenStatus] = useState(
    TOKEN_FORMAT.test(token) ? "checking" : "invalid",
  );
  const [tokenError, setTokenError] = useState("");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Verify token validity on mount so user sees expired/invalid state BEFORE
  // filling the form. BE endpoint is idempotent — does not consume the token.
  useEffect(() => {
    if (tokenStatus !== "checking") return;
    let cancelled = false;
    authService
      .verifyResetToken(token)
      .then(() => {
        if (!cancelled) setTokenStatus("valid");
      })
      .catch((err) => {
        if (cancelled) return;
        setTokenError(err?.message || "Liên kết không hợp lệ");
        setTokenStatus("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [token, tokenStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidPassword(form.password)) {
      setError(
        "Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.",
      );
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      setError(err?.message || "Đặt lại mật khẩu thất bại");
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
            <KeyRound className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">
            Đặt lại mật khẩu
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chọn một mật khẩu mạnh. Sau khi đổi, mọi phiên đăng nhập cũ sẽ tự
            đăng xuất.
          </p>
        </div>

        {done ? (
          <div className="rounded-lg bg-secondary-50 border border-secondary-100 text-secondary-700 px-4 py-4 text-sm flex gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Đặt lại mật khẩu thành công</p>
              <p className="mt-1">Đang chuyển về trang đăng nhập...</p>
            </div>
          </div>
        ) : tokenStatus === "checking" ? (
          <div className="flex items-center justify-center gap-3 text-slate-600 text-sm py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang kiểm tra liên kết...
          </div>
        ) : tokenStatus === "invalid" ? (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-4 text-sm flex gap-3">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">
                Liên kết không hợp lệ hoặc đã hết hạn
              </p>
              <p className="mt-1 text-red-700/80">
                {tokenError || "Vui lòng yêu cầu liên kết mới."}
              </p>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="mt-3 inline-flex items-center gap-1 text-primary-600 font-medium hover:underline"
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
                <PasswordInput
                  native
                  leftIcon={
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  }
                  placeholder="********"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={8}
                  maxLength={72}
                />
                <PasswordChecklist value={form.password} />
              </div>

              <div>
                <label className="label">Xác nhận mật khẩu</label>
                <PasswordInput
                  native
                  leftIcon={
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  }
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  required
                  minLength={8}
                  maxLength={72}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
          Gặp khó khăn?{" "}
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
