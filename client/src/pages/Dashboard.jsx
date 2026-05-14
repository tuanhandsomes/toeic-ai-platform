import { Sparkles, LogOut, Flame, Target, BookOpen, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-heading font-bold">TOEIC AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.fullName}</span>
            <button onClick={logout} className="btn-ghost text-sm">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Chào, {user?.fullName?.split(' ').pop() || 'bạn'} 👋
          </h1>
          <p className="text-slate-600">
            Sẵn sàng cho ngày luyện thi TOEIC hôm nay. Mục tiêu của bạn: {user?.targetScore || 700} điểm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-500" />
              </div>
              <span className="text-sm text-slate-600">Điểm gần nhất</span>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-900">--</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-secondary-500" />
              </div>
              <span className="text-sm text-slate-600">Mục tiêu</span>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-900">{user?.targetScore || 700}</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-tertiary-500" />
              </div>
              <span className="text-sm text-slate-600">Bài đã làm</span>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-900">0</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-slate-600">Chuỗi học</span>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-900">0 ngày</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-heading font-bold mb-4">
            🚀 Hệ thống đang trong quá trình hoàn thiện
          </h2>
          <p className="text-slate-600">
            Backend authentication đã hoạt động. Các module Luyện tập, Full Test, AI phân tích sẽ
            được build trong các ngày tiếp theo của sprint.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            User ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{user?._id}</code>
            {' • '}
            Role: <code className="bg-slate-100 px-1.5 py-0.5 rounded">{user?.role}</code>
          </p>
        </div>
      </main>
    </div>
  );
}
