import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Brain,
  ListChecks,
  BarChart3,
  Headphones,
  BookOpen,
  Target,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { ROUTES } from "../constants/routes.js";

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

const FEATURES = [
  {
    icon: Brain,
    title: "AI phân tích cá nhân hóa",
    desc: "Sau mỗi đề Full Test, AI chỉ rõ điểm mạnh, điểm yếu và gợi ý lộ trình ôn tập theo từng Part.",
  },
  {
    icon: Headphones,
    title: "Đề thi mô phỏng đầy đủ",
    desc: "Bộ đề 200 câu chuẩn cấu trúc TOEIC Listening & Reading, audio chất lượng cao, hình ảnh đầy đủ.",
  },
  {
    icon: ListChecks,
    title: "Luyện theo từng Part",
    desc: "Tách riêng từng Part 1–7 để bạn tập trung khắc phục đúng phần yếu, không cần làm cả đề.",
  },
  {
    icon: BarChart3,
    title: "Thống kê tiến bộ",
    desc: "Theo dõi điểm số, độ chính xác và xu hướng cải thiện qua biểu đồ trực quan theo thời gian.",
  },
  {
    icon: Target,
    title: "Mục tiêu rõ ràng",
    desc: "Đặt mục tiêu điểm TOEIC, hệ thống ước lượng số tuần cần luyện và cho biết bạn đang cách đích bao xa.",
  },
  {
    icon: BookOpen,
    title: "Lịch sử bài làm",
    desc: "Xem lại đáp án đúng/sai, transcript audio và giải thích chi tiết của mọi lần làm bài đã qua.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Làm bài kiểm tra",
    desc: "Chọn đề Full Test 200 câu hoặc luyện theo Part cụ thể. Đồng hồ đếm ngược như thi thật.",
  },
  {
    n: 2,
    title: "Nhận phân tích AI",
    desc: "Hệ thống chấm điểm theo bảng quy đổi TOEIC, AI phân tích điểm mạnh/yếu trong vài giây.",
  },
  {
    n: 3,
    title: "Luyện đúng chỗ yếu",
    desc: "Theo gợi ý của AI, luyện tiếp đúng Part cần cải thiện. Lặp lại để tiến bộ rõ rệt.",
  },
];

const STATS = [
  { value: "2.000+", label: "Câu hỏi luyện tập" },
  { value: "10+", label: "Đề thi đầy đủ" },
  { value: "L & R", label: "Listening + Reading" },
  { value: "7", label: "Part chi tiết" },
];

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-card bg-white shadow-card p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-heading font-semibold text-lg mb-2 text-slate-900">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
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

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-600 hover:text-slate-900">
              Tính năng
            </a>
            <a href="#how" className="text-slate-600 hover:text-slate-900">
              Cách hoạt động
            </a>
            <a href="#stats" className="text-slate-600 hover:text-slate-900">
              Thư viện đề
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={ROUTES.LOGIN} className="btn-ghost text-sm">
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-100 text-primary-700 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> AI phân tích kết quả tự động
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-slate-900 leading-tight mb-5">
              Chinh phục TOEIC bằng dữ liệu của chính bạn
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Làm đề mô phỏng, nhận phân tích cá nhân hóa từ AI, biết chính xác
              mình yếu Part nào và luyện đúng chỗ. Lộ trình rút ngắn — điểm số
              tăng đều.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={ROUTES.REGISTER} className="btn-primary">
                Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to={ROUTES.LOGIN} className="btn-secondary">
                Tôi đã có tài khoản
              </Link>
            </div>
            <ul className="mt-8 space-y-2 text-sm text-slate-600">
              {[
                "Không cần thẻ tín dụng",
                "AI phân tích miễn phí sau mỗi Full Test & Practice",
                "Đề thi mô phỏng chuẩn cấu trúc",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary-500 shrink-0" />{" "}
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual: mock kết quả AI */}
          <div className="relative">
            <div className="rounded-card bg-white shadow-card p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-500">Full Test 01</p>
                  <p className="font-heading font-bold text-2xl text-slate-900">
                    735<span className="text-base text-slate-400">/990</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { part: "Listening", val: 385, max: 495 },
                  { part: "Reading", val: 350, max: 495 },
                ].map((s) => (
                  <div key={s.part}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{s.part}</span>
                      <span className="font-mono">
                        {s.val}/{s.max}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${(s.val / s.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-primary-50 border border-primary-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <p className="text-sm font-semibold text-primary-900">
                    AI phân tích
                  </p>
                </div>
                <ul className="text-sm text-primary-900 space-y-1.5">
                  <li>Điểm mạnh: Part 1 (95%), Part 5 (88%)</li>
                  <li>Cần cải thiện: Part 3 — nghe đoạn hội thoại</li>
                  <li>Ước lượng đạt 800+: 6 tuần</li>
                </ul>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 hidden md:block w-28 h-28 rounded-full bg-secondary-100 blur-2xl opacity-70 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 hidden md:block w-32 h-32 rounded-full bg-primary-200 blur-2xl opacity-60 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3">
              Mọi thứ bạn cần để chinh phục TOEIC
            </h2>
            <p className="text-slate-600">
              Đề thi đầy đủ, luyện theo Part, AI phân tích kết quả, thống kê
              tiến bộ — gói gọn trong một nền tảng.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-3">
              3 bước để bắt đầu
            </h2>
            <p className="text-slate-600">
              Đăng ký xong là làm bài được ngay. Không cần thiết lập phức tạp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="rounded-card bg-white shadow-card p-6 border border-slate-100 h-full">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-heading font-bold flex items-center justify-center mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-slate-900">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                  {s.value}
                </p>
                <p className="text-primary-100 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-4">
            Sẵn sàng tăng điểm TOEIC?
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Đăng ký miễn phí, làm đề Full Test đầu tiên, nhận phân tích AI ngay
            hôm nay.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={ROUTES.REGISTER} className="btn-primary">
              Đăng ký miễn phí <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={ROUTES.LOGIN} className="btn-secondary">
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="font-heading font-bold text-slate-700">
              TOEIC AI
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p>Nền tảng luyện thi TOEIC tích hợp AI</p>
        </div>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
