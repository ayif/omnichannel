"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, Check, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format";
import { AppNotification, NotificationSeverity, NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 45_000;

const SEVERITY_STYLE: Record<NotificationSeverity, { icon: React.ElementType; className: string }> = {
  [NotificationSeverity.WARNING]: { icon: AlertTriangle, className: "text-status-warning" },
  [NotificationSeverity.CRITICAL]: { icon: XCircle, className: "text-status-critical" },
};

const TYPE_TARGET_URL: Record<NotificationType, string> = {
  [NotificationType.STOCK_LOW]: "/produk",
  [NotificationType.SYNC_FAILED]: "/sinkronisasi",
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data: AppNotification[] = await res.json();
      setNotifications(data);
    } catch {
      // Polling diam-diam - kalau gagal sekali, coba lagi di interval berikutnya.
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications/read-all", { method: "POST" });
  }

  async function handleItemClick(notification: AppNotification) {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
    }
    router.push(TYPE_TARGET_URL[notification.type]);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-medium leading-none text-white tabular-nums">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" side="bottom" className="w-80 max-w-[90vw] sm:w-96">
        <div className="flex items-center justify-between px-1.5 py-1">
          <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="size-3" />
              Tandai semua dibaca
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-1.5 py-4 text-center text-xs text-muted-foreground">
            Tidak ada notifikasi baru
          </p>
        ) : (
          <div className="flex max-h-80 flex-col overflow-y-auto">
            {notifications.map((notification) => {
              const { icon: Icon, className } = SEVERITY_STYLE[notification.severity];
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-start gap-2 py-2"
                  onClick={() => handleItemClick(notification)}
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", className)} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className={cn("text-sm", !notification.isRead && "font-medium")}>
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-status-critical" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
