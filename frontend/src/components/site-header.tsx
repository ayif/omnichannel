"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE_TITLE: Record<string, string> = {
  "/": "Dashboard",
  "/produk": "Produk & Stok",
  "/transaksi": "Transaksi",
  "/sinkronisasi": "Sinkronisasi Channel",
};

export function SiteHeader() {
  const pathname = usePathname();
  const title = PAGE_TITLE[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="font-heading text-sm font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
          <Bell />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-status-critical" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
