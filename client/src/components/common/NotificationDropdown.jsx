import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { resultService } from '@/services/resultService';
import { testService } from '@/services/testService';
import {
  buildNotifications,
  getReadIds,
  persistReadIds,
} from '@/utils/notifications';
import { cn } from '@/lib/utils';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?._id;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [readIds, setReadIds] = useState(() => getReadIds(userId));

  // Khi đổi user (logout/login) → đọc lại read state.
  useEffect(() => {
    setReadIds(getReadIds(userId));
  }, [userId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resultsRes, testsRes] = await Promise.all([
        resultService.list({ limit: 50 }),
        testService.list({ limit: 20, sort: '-createdAt' }),
      ]);
      const notifs = buildNotifications({
        results: resultsRes?.data?.items || [],
        tests: testsRes?.data?.items || [],
        user,
      });
      setItems(notifs);
      setLoaded(true);
    } catch {
      setItems([]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unreadCount = useMemo(
    () => items.filter((n) => !readIds.has(n.id)).length,
    [items, readIds],
  );

  const markOne = (id) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    persistReadIds(userId, next);
  };

  const markAll = () => {
    if (unreadCount === 0) return;
    const next = new Set(readIds);
    items.forEach((n) => next.add(n.id));
    setReadIds(next);
    persistReadIds(userId, next);
  };

  const handleItemClick = (n) => {
    markOne(n.id);
    setOpen(false);
    if (n.to) navigate(n.to);
  };

  const hasItems = items.length > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-tertiary-500 ring-2 ring-white text-[10px] font-semibold text-white flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <h3 className="font-heading font-semibold text-slate-900 text-sm">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {loading && !loaded ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : !hasItems ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <BellOff className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Chưa có thông báo mới
              </p>
              <p className="text-xs text-slate-500">
                Tin nhắn mới về đề thi và nhắc nhở sẽ hiện ở đây.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const Icon = n.icon;
                const isRead = readIds.has(n.id);
                const clickable = !!n.to;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      disabled={!clickable && isRead}
                      className={cn(
                        'w-full text-left px-4 py-3 flex gap-3 items-start transition-colors relative',
                        clickable
                          ? 'hover:bg-slate-50 cursor-pointer'
                          : 'cursor-default',
                        !isRead && 'bg-primary-50/30',
                      )}
                    >
                      {/* Vạch chỉ chưa đọc bên trái */}
                      {!isRead && (
                        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary-500" />
                      )}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity',
                          isRead
                            ? 'bg-slate-100 text-slate-500'
                            : n.iconColor || 'bg-slate-100 text-slate-600',
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            isRead
                              ? 'font-normal text-slate-600'
                              : 'font-semibold text-slate-900',
                          )}
                        >
                          {n.title}
                        </p>
                        <p
                          className={cn(
                            'text-xs mt-0.5 leading-relaxed',
                            isRead ? 'text-slate-500' : 'text-slate-600',
                          )}
                        >
                          {n.description}
                        </p>
                        {n.time && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {n.time}
                          </p>
                        )}
                      </div>
                      {!isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"
                          aria-label="Chưa đọc"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
