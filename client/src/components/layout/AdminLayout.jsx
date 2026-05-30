import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  FileQuestion,
  Users,
  ChevronsUpDown,
  User,
  Image as ImageIcon,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HEADER_HEIGHT = "4rem"; // 56px (h-14)

const navItems = [
  { to: ROUTES.ADMIN, label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_TESTS, label: "Đề thi", icon: ClipboardList },
  { to: ROUTES.ADMIN_QUESTIONS, label: "Câu hỏi", icon: FileQuestion },
  { to: ROUTES.ADMIN_MEDIA, label: "Media", icon: ImageIcon },
  { to: ROUTES.ADMIN_USERS, label: "Người dùng", icon: Users },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Khoá body/root scroll khi đang trong admin layout — chỉ <main> bên trong
  // mới scroll. Cleanup tự động khi rời layout (vd điều hướng sang Landing).
  useEffect(() => {
    document.body.classList.add('app-layout-active');
    return () => document.body.classList.remove('app-layout-active');
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } finally {
      setLoggingOut(false);
    }
  };

  const initial = user?.fullName?.charAt(0).toUpperCase() || "A";

  return (
    // SidebarProvider phải wrap cả header để SidebarTrigger (trong header)
    // gọi được useSidebar() từ context. !flex-col override default flex (row).
    <SidebarProvider className="!min-h-0 !flex-col h-dvh overflow-hidden bg-slate-50">
      {/* TOP HEADER (full width, spans across sidebar + content) */}
      <header
        className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shrink-0 z-30"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger toggle — chỉ hiện ở mobile (< 768px) để mở Sheet sidebar */}
          <SidebarTrigger className="md:hidden -ml-1" />
          <Link to={ROUTES.ADMIN} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-heading font-bold text-slate-900">
                TOEIC AI
              </p>
              <p className="text-[11px] text-slate-500 -mt-0.5">Quản trị viên</p>
            </div>
          </Link>
        </div>
      </header>

      {/* SIDEBAR + CONTENT (below header).
          min-h-0 cần thiết để flex-1 children (main) shrink đúng và
          overflow-auto trong main hoạt động — nếu không, content tràn ra
          body → 2 scrollbar (body + main). */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
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
                  {navItems.map(({ to, label, icon: Icon, end }) => {
                    const isActive = end
                      ? location.pathname === to
                      : location.pathname === to ||
                        location.pathname.startsWith(to);
                    return (
                      <SidebarMenuItem key={to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={label}
                        >
                          <NavLink to={to} end={end}>
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
                          Quản trị viên
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setLogoutOpen(true)}
                      className="text-red-600 focus:text-red-700"
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

        <main className="flex-1 min-h-0 overflow-auto py-4 pr-4">
          {children}
        </main>
      </div>

      <Dialog
        open={logoutOpen}
        onOpenChange={(o) => !loggingOut && setLogoutOpen(o)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đăng xuất khỏi trang quản trị?</DialogTitle>
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
              className="btn text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
