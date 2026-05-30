import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import {
  ArrowLeft,
  ShieldCheck,
  Target,
  Calendar,
  Loader2,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  AtSign,
  FileQuestion,
  Clock,
  TrendingUp,
  Trophy,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KpiCard } from "@/components/common/KpiCard";
import { RankBadge } from "@/components/common/RankBadge";
import { adminService } from "@/services/adminService";
import { computeWeeklyKpis } from "@/utils/statsHelpers";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import { isValidPassword } from "@/utils/passwordRules";
import PasswordChecklist from "@/components/common/PasswordChecklist";
import { toast } from "sonner";

const studyTimeConfig = {
  minutes: { label: "Phút học", color: "hsl(var(--chart-3))" },
};
const scoreProgressConfig = {
  avgAccuracy: { label: "Độ chính xác", color: "hsl(var(--chart-1))" },
};

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUserId = useAuthStore((s) => s.user?._id);

  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lockOpen, setLockOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      adminService.getUser(userId),
      adminService.getUserResults(userId, { limit: 100 }).catch(() => ({
        data: { items: [] },
      })),
    ])
      .then(([userRes, resultRes]) => {
        if (cancelled) return;
        const fetched = userRes.data.user;
        // Không cho admin xem chi tiết của admin khác (bao gồm cả chính mình
        // qua route này). Thông tin admin chỉ truy cập qua /profile.
        if (fetched.role === "admin") {
          toast.info("Thông tin admin chỉ xem được qua trang Hồ sơ cá nhân.");
          navigate(ROUTES.ADMIN_USERS, { replace: true });
          return;
        }
        setUser(fetched);
        setResults(resultRes.data.items || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Không tải được người dùng");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, navigate]);

  const stats = useMemo(() => {
    const base = computeWeeklyKpis(results);
    const ranked = results
      .slice()
      .map((r) => ({
        ...r,
        rankScore: r.testType === "full" ? r.scoreTotal : r.accuracy * 10,
      }))
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, 10);
    return { ...base, ranked };
  }, [results]);

  const refreshUser = async () => {
    try {
      const res = await adminService.getUser(userId);
      setUser(res.data.user);
    } catch {
      // ignore
    }
  };

  const handleToggleLock = async () => {
    setBusy(true);
    try {
      await adminService.toggleUserLock(userId, !user.isActive);
      toast.success(
        user.isActive
          ? `Đã khóa "${user.fullName}"`
          : `Đã mở khóa "${user.fullName}"`,
      );
      await refreshUser();
    } catch (err) {
      toast.error(err?.message || "Thao tác thất bại");
    } finally {
      setBusy(false);
      setLockOpen(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await adminService.deleteUser(userId);
      toast.success(`Đã xóa "${user.fullName}"`);
      navigate(ROUTES.ADMIN_USERS);
    } catch (err) {
      toast.error(err?.message || "Xóa thất bại");
    } finally {
      setBusy(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-heading font-bold mb-2">
                Lỗi tải thông tin người dùng
              </h2>
              <p className="text-slate-600 mb-4">
                {error || "Không có dữ liệu"}
              </p>
              <Link to={ROUTES.ADMIN_USERS} className="btn-secondary text-sm">
                Quay lại
              </Link>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const isSelf = String(user._id) === String(currentUserId);
  const initial = user.fullName?.charAt(0).toUpperCase() || "U";
  const fmtDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  return (
    <AdminLayout>
      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* Top bar: back + title + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-lg font-heading font-bold text-slate-900">
            <Link
              to={ROUTES.ADMIN_USERS}
              className="inline-flex items-center gap-1.5 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Quay lại danh sách
            </Link>
            <span className="text-slate-300 font-normal">|</span>
            <span>Trang chi tiết {user.fullName}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLockOpen(true)}
              disabled={isSelf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isSelf ? "Không thể khóa chính bạn" : ""}
            >
              {user.isActive ? (
                <>
                  <Lock className="w-4 h-4" /> Khóa
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" /> Mở khóa
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <KeyRound className="w-4 h-4" /> Đặt lại mật khẩu
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={isSelf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-tertiary-200 text-tertiary-700 hover:bg-tertiary-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isSelf ? "Không thể xóa chính bạn" : ""}
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
          </div>
        </div>

        {/* Profile + meta */}
        <Card>
          <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-center">
            {/* Left: avatar + name + email */}
            <div className="flex items-center gap-4 lg:pr-8">
              <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-heading font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-heading font-bold text-slate-900 truncate">
                  {user.fullName}
                </h2>
                <p className="text-sm text-slate-500 inline-flex items-center gap-1.5 mt-0.5 truncate">
                  <AtSign className="w-3.5 h-3.5 shrink-0" /> {user.email}
                </p>
                {isSelf && (
                  <Badge variant="muted" className="mt-2">
                    Bạn
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <InfoItem label="Vai trò">
                {user.role === "admin" ? (
                  <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="muted">User</Badge>
                )}
              </InfoItem>
              <InfoItem label="Trạng thái">
                {user.isActive ? (
                  <Badge className="bg-secondary-100 text-secondary-700 border-secondary-200">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge className="bg-tertiary-100 text-tertiary-700 border-tertiary-200">
                    Đã khóa
                  </Badge>
                )}
              </InfoItem>
              <InfoItem
                label="Mục tiêu điểm TOEIC"
                icon={<Target className="w-3.5 h-3.5" />}
              >
                <span className="font-mono font-semibold text-slate-900">
                  {user.role === "admin" ? "—" : user.targetScore || 700}
                </span>
              </InfoItem>
              <InfoItem
                label="Số lần phân tích AI"
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                <span className="font-mono font-semibold text-slate-900">
                  {user.aiAnalysisCount ?? 0}
                </span>
              </InfoItem>
              <InfoItem
                label="Ngày tham gia"
                icon={<Calendar className="w-3.5 h-3.5" />}
              >
                <span className="font-mono text-slate-900">
                  {fmtDate(user.createdAt)}
                </span>
              </InfoItem>
              <InfoItem
                label="Cập nhật"
                icon={<Calendar className="w-3.5 h-3.5" />}
              >
                <span className="font-mono text-slate-900">
                  {fmtDate(user.updatedAt)}
                </span>
              </InfoItem>
            </div>
          </CardContent>
        </Card>

        {/* KPI cards — đồng bộ với Statistics: value = tổng 7 ngày, sub = TB/ngày,
            change = delta tuyệt đối so với 7 ngày trước */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={FileQuestion}
            color="primary"
            label="Bài đã làm (7 ngày)"
            value={stats.kpis.tests.value}
            unit="bài"
            sub={stats.kpis.tests.sub}
            change={stats.kpis.tests.change}
            changeUnit={stats.kpis.tests.changeUnit}
          />
          <KpiCard
            icon={Target}
            color="secondary"
            label="Câu đã làm (7 ngày)"
            value={stats.kpis.questions.value}
            unit="câu"
            sub={stats.kpis.questions.sub}
            change={stats.kpis.questions.change}
            changeUnit={stats.kpis.questions.changeUnit}
          />
          <KpiCard
            icon={Clock}
            color="tertiary"
            label="Thời gian học (7 ngày)"
            value={stats.kpis.minutes.value}
            sub={stats.kpis.minutes.sub}
            change={stats.kpis.minutes.change}
            changeUnit={stats.kpis.minutes.changeUnit}
          />
          <KpiCard
            icon={TrendingUp}
            color="violet"
            label="Độ chính xác (7 ngày)"
            value={stats.kpis.accuracy.value}
            unit="%"
            sub={stats.kpis.accuracy.sub}
            change={stats.kpis.accuracy.change}
            changeUnit={stats.kpis.accuracy.changeUnit}
          />
        </div>

        {/* Charts */}
        {results.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="font-heading font-semibold text-xl">
                Hoạt động 7 ngày qua
              </h2>
              <p className="text-sm text-slate-500">{stats.dateRange}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-tertiary-600" />
                  Thời gian học 7 ngày qua
                </CardTitle>
                <CardDescription>Tổng phút học mỗi ngày</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={studyTimeConfig}
                  className="h-[220px] w-full"
                >
                  <LineChart
                    data={stats.thisWeek}
                    margin={{ top: 24, right: 16, left: 16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                    />
                    <YAxis hide domain={[0, "dataMax + 20"]} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => `Ngày ${label}`}
                          indicator="dot"
                        />
                      }
                    />
                    <Line
                      dataKey="minutes"
                      type="monotone"
                      stroke="var(--color-minutes)"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "var(--color-minutes)",
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                    >
                      <LabelList
                        dataKey="minutes"
                        position="top"
                        offset={10}
                        className="fill-slate-900"
                        fontSize={12}
                        fontWeight={600}
                      />
                    </Line>
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  Tiến độ điểm số 7 ngày qua
                </CardTitle>
                <CardDescription>
                  Độ chính xác trung bình mỗi ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={scoreProgressConfig}
                  className="h-[220px] w-full"
                >
                  <LineChart
                    data={stats.thisWeek}
                    margin={{ top: 24, right: 16, left: 16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => `Ngày ${label}`}
                          indicator="dot"
                          formatter={(value) => [`${value}%`, " Độ chính xác"]}
                        />
                      }
                    />
                    <Line
                      dataKey="avgAccuracy"
                      type="monotone"
                      stroke="var(--color-avgAccuracy)"
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "var(--color-avgAccuracy)",
                        strokeWidth: 0,
                      }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
                    >
                      <LabelList
                        dataKey="avgAccuracy"
                        position="top"
                        offset={10}
                        className="fill-slate-900"
                        fontSize={12}
                        fontWeight={600}
                        formatter={(v) => (v > 0 ? `${v}%` : "")}
                      />
                    </Line>
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            </div>
          </section>
        )}

        {/* Ranking table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Bảng xếp hạng điểm số
            </CardTitle>
            <CardDescription>
              Top 10 bài làm tốt nhất của {user.fullName}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {stats.ranked.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                Người dùng chưa có bài làm nào.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center pl-6">
                      Hạng
                    </TableHead>
                    <TableHead>Bài thi</TableHead>
                    <TableHead className="w-28">Loại</TableHead>
                    <TableHead className="w-32">Ngày làm</TableHead>
                    <TableHead className="w-32 text-right">Điểm</TableHead>
                    <TableHead className="w-12 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.ranked.map((r, i) => {
                    const isFullTest = r.testType === "full";
                    const date = new Date(r.submittedAt).toLocaleDateString(
                      "vi-VN",
                    );
                    return (
                      <TableRow key={r._id}>
                        <TableCell className="text-center pl-6">
                          <RankBadge rank={i + 1} />
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.testId?.title || "Đề thi"}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {isFullTest ? "Full Test" : "Luyện tập"}
                        </TableCell>
                        <TableCell className="text-slate-600">{date}</TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {isFullTest ? (
                            <>
                              {r.scoreTotal}
                              <span className="text-xs text-slate-400 ml-1">
                                /990
                              </span>
                            </>
                          ) : (
                            <>
                              {r.accuracy}%
                              <span className="text-xs text-slate-400 ml-1">
                                ({r.correctCount}/{r.totalQuestions})
                              </span>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Link
                            to={`/results/${r._id}`}
                            className="inline-flex items-center text-primary-600 hover:text-primary-700"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lock/Unlock dialog */}
      <Dialog open={lockOpen} onOpenChange={(o) => !o && setLockOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {user.isActive ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </DialogTitle>
            <DialogDescription>
              {user.isActive
                ? `Sau khi khóa, "${user.fullName}" sẽ không thể đăng nhập. Mọi phiên hoạt động hiện tại sẽ tự đăng xuất.`
                : `Mở khóa cho phép "${user.fullName}" đăng nhập lại bình thường.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setLockOpen(false)}
              disabled={busy}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleToggleLock}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md text-white disabled:opacity-50 ${user.isActive ? "bg-tertiary-500 hover:bg-tertiary-600" : "bg-secondary-500 hover:bg-secondary-600"}`}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {user.isActive ? "Khóa" : "Mở khóa"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResetPasswordDialog
        open={resetOpen}
        user={user}
        onClose={() => setResetOpen(false)}
      />

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => !o && setDeleteOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa người dùng?</DialogTitle>
            <DialogDescription>
              "{user.fullName}" sẽ bị xóa vĩnh viễn cùng toàn bộ kết quả bài
              làm. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={busy}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function InfoItem({ label, icon, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1 inline-flex items-center gap-1">
        {icon}
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

function ResetPasswordDialog({ open, user, onClose }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!isValidPassword(pwd)) {
      setErr("Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.");
      return;
    }
    setBusy(true);
    try {
      await adminService.resetUserPassword(user._id, pwd);
      toast.success(`Đã đặt lại mật khẩu cho "${user.fullName}"`);
      setPwd("");
      onClose();
    } catch (e2) {
      setErr(e2?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogDescription>
            Tạo mật khẩu mới cho "{user.fullName}". User sẽ phải đăng nhập lại
            bằng mật khẩu này.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Mật khẩu mới</Label>
            <Input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <PasswordChecklist value={pwd} />
            {err && <p className="text-xs text-tertiary-600 mt-1">{err}</p>}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn-ghost text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary text-sm"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              Đặt lại
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
