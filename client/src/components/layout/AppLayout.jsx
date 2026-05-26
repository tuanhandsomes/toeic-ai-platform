import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  LogOut,
  Home,
  PenTool,
  ClipboardCheck,
  BarChart3,
  History,
  User,
  Bell,
  ChevronsUpDown,
  Settings,
  KeyRound,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HEADER_HEIGHT = "4.5rem"; // 56px (h-14)

const navItems = [
  { to: ROUTES.DASHBOARD, label: "Tổng quan", icon: Home },
  { to: ROUTES.PRACTICE, label: "Luyện tập", icon: PenTool },
  { to: ROUTES.FULL_TEST, label: "Full Test", icon: ClipboardCheck },
  { to: ROUTES.RESULTS, label: "Lịch sử", icon: History },
  { to: ROUTES.STATISTICS, label: "Thống kê", icon: BarChart3 },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } finally {
      setLoggingOut(false);
    }
  };

  const initial = user?.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* TOP HEADER (full width, spans across sidebar + content) */}
      <header
        className="flex items-center justify-between border-b border-slate-200 bg-white px-6 shrink-0 z-30"
        style={{ height: HEADER_HEIGHT }}
      >
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-heading font-bold text-slate-900">
            TOEIC AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* SIDEBAR + CONTENT (below header) */}
      <SidebarProvider className="!min-h-0 flex-1 overflow-hidden">
        <Sidebar
          variant="floating"
          collapsible="icon"
          style={{
            top: HEADER_HEIGHT,
            height: `calc(100svh - ${HEADER_HEIGHT})`,
          }}
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map(({ to, label, icon: Icon }) => {
                    const isActive =
                      location.pathname === to ||
                      (to !== ROUTES.DASHBOARD &&
                        location.pathname.startsWith(to));
                    return (
                      <SidebarMenuItem key={to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={label}
                        >
                          <NavLink to={to}>
                            <Icon />
                            <span>{label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* USER DROPDOWN ở Footer */}
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold text-sm flex-shrink-0">
                        {initial}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-slate-900">
                          {user?.fullName}
                        </span>
                        <span className="truncate text-xs text-slate-500">
                          Mục tiêu: {user?.targetScore || 700}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="w-56"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {user?.fullName}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                      <User /> Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                      <Settings /> Cài đặt tài khoản
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                      <KeyRound /> Đổi mật khẩu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setLogoutOpen(true)}
                      className="text-tertiary-600 focus:text-tertiary-700"
                    >
                      <LogOut /> Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <main className="flex-1 overflow-auto py-4 pr-4">{children}</main>
      </SidebarProvider>

      <Dialog
        open={logoutOpen}
        onOpenChange={(o) => !loggingOut && setLogoutOpen(o)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đăng xuất tài khoản?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              disabled={loggingOut}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn text-sm text-white bg-tertiary-500 hover:bg-tertiary-600"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
