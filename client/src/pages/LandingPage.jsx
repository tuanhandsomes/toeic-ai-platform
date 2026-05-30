import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Library,
  Timer,
  Wand2,
  Map,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  ArrowUp,
  Play,
  Flame,
  Send,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../constants/routes.js";
import { contactService } from "../services/contactService.js";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 hover:shadow-xl flex items-center justify-center transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

const NAV_LINKS = [
  { label: "Tính năng", href: "#features" },
  { label: "Lộ trình học", href: "#roadmap" },
  { label: "Đề thi mẫu", href: ROUTES.REGISTER },
  { label: "Liên hệ", href: "#contact" },
];

const ROADMAP_STEPS = [
  {
    n: 1,
    title: "Đăng ký tài khoản",
    desc: "Miễn phí, không cần thẻ tín dụng. Chọn mục tiêu điểm TOEIC của bạn ngay từ đầu.",
  },
  {
    n: 2,
    title: "Làm bài luyện tập hoặc Full Test",
    desc: "Đề thi mô phỏng chuẩn cấu trúc, đồng hồ đếm ngược, audio chất lượng cao như thi thật.",
  },
  {
    n: 3,
    title: "Nhận phân tích cá nhân từ AI",
    desc: "AI chỉ rõ điểm mạnh, điểm yếu và gợi ý Part cần luyện tiếp theo. Lặp lại để tiến bộ.",
  },
];

const FEATURES = [
  {
    icon: Library,
    iconBg: "bg-primary-50 text-primary-600",
    title: "Ngân hàng đề thi đa dạng",
    desc: "Hàng nghìn câu hỏi nội dung được cập nhật liên tục từ các đề thi thật và format mới nhất.",
  },
  {
    icon: Timer,
    iconBg: "bg-orange-50 text-orange-600",
    title: "Thi thử như thật",
    desc: "Giao diện bấm giờ chuẩn quốc tế, giúp bạn quen áp lực thời gian trong phòng thi.",
  },
  {
    icon: Wand2,
    iconBg: "bg-secondary-50 text-secondary-600",
    title: "AI chữa lỗi chi tiết",
    desc: "Phân tích từng đáp án sai, giải thích ngữ pháp và từ vựng cần khi gặp tại đáp án.",
  },
  {
    icon: Map,
    iconBg: "bg-primary-50 text-primary-600",
    title: "Lộ trình cá nhân hóa",
    desc: "AI tự động thiết kế bài tập bám sát điểm yếu của riêng bạn sau mỗi bài làm test.",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-secondary-50 text-secondary-600",
    title: "Theo dõi tiến độ",
    desc: "Biểu đồ trực quan giúp bạn lại quá trình bộ qua từng ngày, dự đoán điểm số mục tiêu.",
  },
  {
    icon: Lightbulb,
    iconBg: "bg-amber-50 text-amber-600",
    title: "Mẹo làm bài (Tips)",
    desc: "Tổng hợp các bẫy thường gặp và kỹ năng tránh bẫy hiệu quả cho từng Part.",
  },
];

const STATS = [
  { value: "10.000+", label: "Câu hỏi luyện tập" },
  { value: "200+", label: "Đề thi Full Test" },
  { value: "5s", label: "AI phân tích lỗi sai" },
  { value: "7/7", label: "Part bám sát cấu trúc" },
];

const AVATAR_GRADIENTS = [
  "from-pink-300 to-pink-500",
  "from-amber-300 to-amber-500",
  "from-emerald-300 to-emerald-500",
  "from-violet-300 to-violet-500",
];

const CHART_BARS = [55, 72, 48, 90, 65];

function FeatureCard({ icon: Icon, iconBg, title, desc, delay = 0, visible }) {
  return (
    <Link
      to={ROUTES.REGISTER}
      style={{ animationDelay: `${delay}ms` }}
      className={`group block rounded-card bg-white border border-slate-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary-200 ${
        visible ? "animate-fade-in-up" : "opacity-0"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-heading font-semibold text-base mb-1.5 text-slate-900 group-hover:text-primary-700 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </Link>
  );
}

function FooterCol({ title, items }) {
  const itemCls =
    "text-sm text-slate-500 hover:text-slate-800 transition-colors";
  return (
    <div>
      <h4 className="font-heading font-semibold text-sm text-primary-700 mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            {i.href.startsWith("#") ? (
              <a href={i.href} className={itemCls}>
                {i.label}
              </a>
            ) : (
              <Link to={i.href} className={itemCls}>
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsBand() {
  const [ref, inView] = useInView(0.3);
  return (
    <section id="tests" ref={ref} className="bg-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{ animationDelay: `${i * 100}ms` }}
            className={inView ? "animate-fade-in-up" : "opacity-0"}
          >
            <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
              {s.value}
            </p>
            <p className="text-primary-100 text-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadmapSection() {
  const [ref, inView] = useInView(0.15);
  return (
    <section id="roadmap" ref={ref} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-2xl mx-auto text-center mb-10 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3">
            Lộ trình học 3 bước
          </h2>
          <p className="text-slate-600 text-sm">
            Đơn giản, hiệu quả. Bắt đầu trong vài phút và thấy tiến bộ sau mỗi
            bài làm.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {ROADMAP_STEPS.map((s, i) => (
            <div
              key={s.n}
              style={{ animationDelay: `${150 + i * 100}ms` }}
              className={`rounded-card bg-white border border-slate-200 p-6 ${
                inView ? "animate-fade-in-up" : "opacity-0"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-heading font-bold flex items-center justify-center mb-3">
                {s.n}
              </div>
              <h3 className="font-heading font-semibold text-base mb-1.5 text-slate-900">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Local-part và domain của email "tạm thời" rõ ràng — chặn tại FE để
// có message tiếng Việt rõ ràng, BE vẫn double-check (defense in depth).
const SUSPICIOUS_LOCAL = /^(trash|temp|fake|throwaway|spam|junk|disposable|burner|noreply|no-reply)(mail|email|inbox)?\d*$/i;
const DISPOSABLE_DOMAINS_FE = new Set([
  "mailinator.com", "tempmail.com", "tempmail.net", "10minutemail.com",
  "yopmail.com", "guerrillamail.com", "throwawaymail.com", "fakeinbox.com",
  "trashmail.com", "maildrop.cc", "getnada.com", "sharklasers.com",
  "dispostable.com", "mintemail.com",
]);

function ContactSection() {
  const [ref, inView] = useInView(0.15);
  // `website` là honeypot — bot tự fill, user thật không thấy field.
  // BE reject nếu non-empty (xem contactValidation.js).
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);

  // Trả về message lỗi cho 1 field, hoặc null nếu OK.
  const validateField = (field, value) => {
    const v = (value ?? "").trim();
    if (field === "name") {
      if (v.length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
      if (!/[\p{L}]/u.test(v)) return "Họ và tên phải chứa chữ cái";
      return null;
    }
    if (field === "email") {
      const lower = v.toLowerCase();
      if (!lower) return "Vui lòng nhập email";
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i.test(lower))
        return "Email không đúng định dạng";
      const [local, domain] = lower.split("@");
      if (SUSPICIOUS_LOCAL.test(local))
        return "Vui lòng dùng email cá nhân thật (không nhận email tạm thời)";
      if (DISPOSABLE_DOMAINS_FE.has(domain))
        return "Vui lòng dùng email cá nhân thật (không nhận email tạm thời)";
      return null;
    }
    if (field === "message") {
      if (v.length < 10) return "Nội dung tin nhắn phải có ít nhất 10 ký tự";
      if (v.length > 2000) return "Nội dung tin nhắn tối đa 2000 ký tự";
      return null;
    }
    return null;
  };

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Nếu đã touched + đang có lỗi → re-validate live cho user thấy sửa OK.
    if (touched[field] && errors[field]) {
      const err = validateField(field, value);
      setErrors((e) => ({ ...e, [field]: err || undefined }));
    }
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((e) => ({ ...e, [field]: err || undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    ["name", "email", "message"].forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(newErrors).length > 0) return;

    setSending(true);
    try {
      await contactService.send(form);
      toast.success("Đã gửi tin nhắn — chúng tôi sẽ phản hồi sớm nhất!");
      setForm({ name: "", email: "", message: "", website: "" });
      setTouched({});
      setErrors({});
    } catch (err) {
      const fieldMsg = err?.details?.[0]?.message;
      const msg =
        fieldMsg ||
        err?.message ||
        "Không gửi được tin nhắn. Vui lòng thử lại sau ít phút.";
      // Nếu BE chỉ rõ field nào lỗi → gắn inline + scroll vào field đó.
      const field = err?.details?.[0]?.field;
      if (field && ["name", "email", "message"].includes(field)) {
        setErrors((e) => ({ ...e, [field]: fieldMsg }));
        setTouched((t) => ({ ...t, [field]: true }));
      } else {
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="py-16 md:py-20 bg-gradient-to-br from-primary-50/40 via-white to-secondary-50/30"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="inline-flex w-14 h-14 rounded-full bg-primary-100 text-primary-600 items-center justify-center mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3">
            Liên hệ với chúng tôi
          </h2>
          <p className="text-slate-600 text-sm">
            Bạn có câu hỏi hoặc góp ý? Hãy để lại tin nhắn — chúng tôi sẽ phản
            hồi lại bạn sớm nhất có thể!
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ animationDelay: "200ms" }}
          className={`rounded-2xl bg-white border border-slate-200 shadow-card p-6 md:p-8 space-y-4 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Honeypot — ẩn hoàn toàn với user thật, bot tự động fill */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setField("website", e.target.value)}
            className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
            aria-hidden="true"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={`input ${
                  errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : ""
                }`}
                placeholder="Nhập tên của bạn"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`input ${
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : ""
                }`}
                placeholder="email@example.com"
                inputMode="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nội dung
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              onBlur={() => handleBlur("message")}
              className={`input resize-none ${
                errors.message
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : ""
              }`}
              placeholder="Câu hỏi hoặc góp ý của bạn..."
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-red-600 mt-1">{errors.message}</p>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={sending}
              className="btn-primary transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {sending ? (
                "Đang gửi..."
              ) : (
                <>
                  Gửi tin nhắn <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, inView] = useInView(0.1);
  return (
    <section id="features" ref={ref} className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-2xl mx-auto text-center mb-10 ${
            inView ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3">
            Tính năng nổi bật
          </h2>
          <p className="text-slate-600 text-sm">
            Công nghệ AI tiên tiến giúp cá nhân hóa trải nghiệm học, tiết kiệm
            thời gian và nâng cao điểm số hiệu quả.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.title}
              {...f}
              visible={inView}
              delay={150 + i * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroPreviewCard() {
  return (
    <div
      className="relative animate-fade-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="rounded-2xl bg-white shadow-elevated border border-slate-100 overflow-hidden">
        {/* Browser-mock tab bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-auto text-xs text-slate-500 font-mono">
            Test_04_Pro.pdf
          </span>
        </div>

        <div className="p-6">
          {/* Score + delta badge */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">Dự đoán điểm</p>
              <p className="text-5xl font-heading font-bold text-slate-900 leading-none">
                745
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 text-xs font-semibold animate-pulse-soft">
              +45 điểm
            </span>
          </div>

          {/* AI message bubble */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 mb-5">
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Bạn đang làm rất tốt ở Part 2, nhưng cần cải thiện từ vựng chuyên
              ngành kinh tế ở Part 7. Gợi ý bài tập luyện tập chuyên sâu nhé!
            </p>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-24">
            {CHART_BARS.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-primary-200 to-primary-500 origin-bottom animate-grow-bar"
                style={{
                  height: `${h}%`,
                  animationDelay: `${700 + i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating streak popup */}
      <div
        className="absolute -bottom-4 right-4 sm:right-6 bg-white rounded-xl shadow-elevated border border-slate-100 px-3 py-2 flex items-center gap-2.5 animate-float-gentle"
        style={{ animationDelay: "1.4s" }}
      >
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Flame className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 leading-tight">Chuỗi học</p>
          <p className="text-xs font-semibold text-slate-900 leading-tight">
            12 ngày liên tục
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2"
            aria-label="Lên đầu trang"
          >
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-heading font-bold text-slate-900">
              TOEIC AI
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {NAV_LINKS.map((l) => {
              const cls =
                "text-slate-600 hover:text-slate-900 transition-colors";
              // href bắt đầu '#' → anchor scroll trong page; else → React Router Link
              return l.href.startsWith("#") ? (
                <a key={l.label} href={l.href} className={cls}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} className={cls}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md"
            >
              Đăng nhập
            </Link>
            <Link to={ROUTES.REGISTER} className="btn-primary text-sm">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-secondary-50/30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1 rounded-full mb-5 animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Phiên bản beta
            </span>
            <h1
              className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-tight mb-5 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              Luyện thi TOEIC{" "}
              <span className="text-primary-600">thông minh</span> với AI
            </h1>
            <p
              className="text-base text-slate-600 mb-7 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              Phân tích bài làm cá nhân hóa, chỉ ra điểm yếu và đề xuất lộ trình
              tối ưu giúp bạn đạt mục tiêu điểm số nhanh nhất.
            </p>
            <div
              className="flex flex-wrap items-center gap-3 mb-7 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to={ROUTES.REGISTER}
                className="btn-primary transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#roadmap"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors group"
              >
                <Play className="w-4 h-4 transition-transform group-hover:scale-110" />{" "}
                Cách hoạt động
              </a>
            </div>

            <div
              className="flex items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex -space-x-2">
                {AVATAR_GRADIENTS.map((g, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white transition-transform hover:scale-110 hover:z-10`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Hơn <strong className="text-slate-900">10.000+ học viên</strong>{" "}
                đã tin dùng
              </p>
            </div>
          </div>

          <HeroPreviewCard />
        </div>
      </section>

      <StatsBand />

      <RoadmapSection />

      <FeaturesSection />

      <ContactSection />

      {/* Footer */}
      <footer
        id="footer"
        className="bg-white border-t border-slate-100 pt-12 pb-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <span className="font-heading font-bold text-slate-900">
                  TOEIC AI
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Nền tảng luyện thi TOEIC thông minh ứng dụng AI hàng đầu.
              </p>
            </div>

            <FooterCol
              title="Sản phẩm"
              items={[
                { label: "Tính năng", href: "#features" },
                { label: "Lộ trình học", href: "#roadmap" },
              ]}
            />

            <FooterCol
              title="Tài nguyên"
              items={[
                { label: "Đề thi mẫu", href: ROUTES.REGISTER },
                { label: "Hỗ trợ", href: "#contact" },
              ]}
            />

            <FooterCol
              title="Pháp lý"
              items={[
                { label: "Privacy Policy", href: "#features" },
                { label: "Terms of Service", href: "#features" },
                { label: "Contact Us", href: "#contact" },
              ]}
            />
          </div>

          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} TOEIC AI. All rights reserved.
          </div>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
