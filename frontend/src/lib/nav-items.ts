import {
  Calculator,
  History,
  LayoutDashboard,
  Package,
  Receipt,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Role } from "@/lib/types";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: [Role.ADMIN, Role.STAFF] },
  { title: "Produk & Stok", url: "/produk", icon: Package, roles: [Role.ADMIN, Role.STAFF, Role.GUDANG] },
  { title: "Transaksi", url: "/transaksi", icon: Receipt, roles: [Role.ADMIN, Role.STAFF] },
  { title: "Akuntansi", url: "/akuntansi", icon: Calculator, roles: [Role.ADMIN, Role.STAFF] },
  { title: "Analisis Produk", url: "/analisis-produk", icon: Sparkles, roles: [Role.ADMIN, Role.STAFF] },
  { title: "Sinkronisasi", url: "/sinkronisasi", icon: RefreshCw, roles: [Role.ADMIN, Role.STAFF] },
  { title: "Log Aktivitas", url: "/log-aktivitas", icon: History, roles: [Role.ADMIN] },
];
