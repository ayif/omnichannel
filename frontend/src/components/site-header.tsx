"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { CommandPalette } from "@/components/command-palette";
import type { SessionUser } from "@/lib/session";

const PAGE_TITLE: Record<string, string> = {
  "/": "Dashboard",
  "/produk": "Produk & Stok",
  "/transaksi": "Transaksi",
  "/akuntansi": "Akuntansi",
  "/analisis-produk": "Analisis Produk",
  "/sinkronisasi": "Sinkronisasi Channel",
  "/log-aktivitas": "Log Aktivitas",
};

export function SiteHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const title = PAGE_TITLE[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="font-heading text-sm font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <CommandPalette user={user} />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
