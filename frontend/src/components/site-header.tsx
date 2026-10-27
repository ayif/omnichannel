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
  "/pengaturan": "Pengaturan",
};

export function SiteHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const title = PAGE_TITLE[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1 rounded-xl" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Workspace
        </span>
        <h1 className="font-heading text-sm font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <CommandPalette user={user} />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
