import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  FileQuestion,
  Users,
  ExternalLink,
  ChevronsUpDown,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
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

const HEADER_HEIGHT = "4rem"; // 56px (h-14)

const navItems = [
  { to: ROUTES.ADMIN, label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_TESTS, label: "Đề thi", icon: ClipboardList },
  { to: ROUTES.ADMIN_QUESTIONS, label: "Câu hỏi", icon: FileQuestion },
  { to: ROUTES.ADMIN_USERS, label: "Người dùng", icon: Users },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const initial = user?.fullName?.charAt(0).toUpperCase() || "A";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* TOP HEADER (full width, spans across sidebar + content) */}
      <header
        className="flex items-center justify-between border-b border-slate-200 bg-white px-6 shrink-0 z-30"
        style={{ height: HEADER_HEIGHT }}
      >
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

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2 px-3 h-9 rounded-md text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            title="Mở app người dùng"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Mở app user</span>
          </Link>
        </div>
      </header>

      {/* SIDEBAR + CONTENT (below header) */}
      <SidebarProvider className="!min-h-0 flex-1 overflow-hidden">
        <Sidebar
          variant="floating"
          collapsible="icon"
          style={{ top: HEADER_HEIGHT, height: `calc(100svh - ${HEADER_HEIGHT})` }}
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
                    <DropdownMenuItem
                      onClick={() => navigate(ROUTES.DASHBOARD)}
                    >
                      <ExternalLink /> Mở app user
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
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
    </div>
  );
}
