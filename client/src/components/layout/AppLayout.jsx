import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, Home, PenTool, ClipboardCheck, BarChart3, History, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { ROUTES } from '../../constants/routes.js';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Tổng quan', icon: Home },
  { to: ROUTES.PRACTICE, label: 'Luyện tập', icon: PenTool },
  { to: ROUTES.FULL_TEST, label: 'Full Test', icon: ClipboardCheck },
  { to: ROUTES.RESULTS, label: 'Lịch sử', icon: History },
  { to: ROUTES.STATISTICS, label: 'Thống kê', icon: BarChart3 },
  { to: ROUTES.PROFILE, label: 'Hồ sơ', icon: User },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 px-6 py-5 border-b border-slate-200">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <span className="text-lg font-heading font-bold">TOEIC AI</span>
        </Link>

        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500">Mục tiêu: {user?.targetScore || 700}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 border-t border-slate-200"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
