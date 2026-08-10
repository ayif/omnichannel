"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { LogOut, Moon, RefreshCw, Search, Sun, SunMoon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/nav-items";
import { CHANNEL_LABEL, Channel, Role } from "@/lib/types";
import type { SessionUser } from "@/lib/session";

function isMac() {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().includes("MAC");
}

export function CommandPalette({ user }: { user: SessionUser }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const canSync = user.role === Role.ADMIN || user.role === Role.STAFF;

  function go(url: string) {
    setOpen(false);
    router.push(url);
  }

  async function handleSyncTrigger(channel: Channel) {
    setOpen(false);
    try {
      const res = await fetch(`/api/sync/${channel}/trigger`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(`Sync ${CHANNEL_LABEL[channel]} dijadwalkan`);
      router.refresh();
    } catch {
      toast.error(`Gagal menjadwalkan sync ${CHANNEL_LABEL[channel]}`);
    }
  }

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Cari...</span>
        <kbd className="hidden items-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-flex">
          {isMac() ? "⌘K" : "Ctrl K"}
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari menu atau aksi..." />
        <CommandList>
          <CommandEmpty>Tidak ditemukan.</CommandEmpty>

          <CommandGroup heading="Menu">
            {navItems.map((item) => (
              <CommandItem key={item.url} onSelect={() => go(item.url)}>
                <item.icon />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>

          {canSync && (
            <CommandGroup heading="Aksi">
              {Object.values(Channel).map((channel) => (
                <CommandItem key={channel} onSelect={() => handleSyncTrigger(channel)}>
                  <RefreshCw />
                  Sync Manual {CHANNEL_LABEL[channel]}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Tampilan">
            <CommandItem onSelect={() => { setTheme("light"); setOpen(false); }}>
              <Sun />
              Mode Terang
            </CommandItem>
            <CommandItem onSelect={() => { setTheme("dark"); setOpen(false); }}>
              <Moon />
              Mode Gelap
            </CommandItem>
            <CommandItem onSelect={() => { setTheme("system"); setOpen(false); }}>
              <SunMoon />
              Ikuti Sistem
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Akun">
            <CommandItem onSelect={handleLogout}>
              <LogOut />
              Keluar
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
