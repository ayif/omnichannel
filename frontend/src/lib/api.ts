import { redirect } from "next/navigation";
import { getToken } from "./session";
import {
  AppUser,
  AuditAction,
  AuditLog,
  BusinessSettings,
  Channel,
  ChannelAccount,
  LabaRugiResponse,
  Product,
  ProdukTerlaris,
  StokTercepatHabis,
  SyncLog,
  Transaction,
} from "./types";

/**
 * Dipakai HANYA dari Server Component. `API_URL` (tanpa prefix NEXT_PUBLIC_)
 * cuma tersedia di server - di dalam Docker ini menunjuk ke nama service
 * `backend`, sedangkan NEXT_PUBLIC_API_URL (dipakai Client Component lewat
 * browser) menunjuk ke host yang sudah di-publish.
 */
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    throw new Error(`Gagal memuat ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface DailyChannelRevenue {
  date: string;
  tokopedia: number;
  shopee: number;
  website: number;
  tiktokshop: number;
}

export interface DashboardStats {
  totalPenjualan: number;
  totalTransaksi: number;
  stokMenipis: number;
  channelAktif: number;
  channelBermasalah: number;
}

export function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export function getTransactions(params?: { channel?: Channel; limit?: number }): Promise<Transaction[]> {
  const qs = new URLSearchParams();
  if (params?.channel) qs.set("channel", params.channel);
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<Transaction[]>(`/transactions${suffix}`);
}

export function getSyncLogs(): Promise<SyncLog[]> {
  return apiFetch<SyncLog[]>("/sync-logs");
}

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/dashboard/stats");
}

export function getSalesTrend(): Promise<DailyChannelRevenue[]> {
  return apiFetch<DailyChannelRevenue[]>("/dashboard/sales-trend");
}

export function getChannelTotals(): Promise<{ channel: Channel; total: number }[]> {
  return apiFetch<{ channel: Channel; total: number }[]>("/dashboard/channel-totals");
}

export function getChannelAccounts(): Promise<ChannelAccount[]> {
  return apiFetch<ChannelAccount[]>("/channel-accounts");
}

export function getBusinessSettings(): Promise<BusinessSettings> {
  return apiFetch<BusinessSettings>("/settings/business");
}

export function getUsers(): Promise<AppUser[]> {
  return apiFetch<AppUser[]>("/users");
}

export function getLabaRugi(params?: {
  channel?: Channel;
  startDate?: string;
  endDate?: string;
}): Promise<LabaRugiResponse> {
  const qs = new URLSearchParams();
  if (params?.channel) qs.set("channel", params.channel);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<LabaRugiResponse>(`/accounting/laba-rugi${suffix}`);
}

export function getAuditLogs(params?: {
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}): Promise<AuditLog[]> {
  const qs = new URLSearchParams();
  if (params?.action) qs.set("action", params.action);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<AuditLog[]>(`/audit-logs${suffix}`);
}

export function getProdukTerlaris(params?: {
  channel?: Channel;
  startDate?: string;
  endDate?: string;
}): Promise<ProdukTerlaris[]> {
  const qs = new URLSearchParams();
  if (params?.channel) qs.set("channel", params.channel);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<ProdukTerlaris[]>(`/analytics/produk-terlaris${suffix}`);
}

export function getStokTercepatHabis(params?: { lookbackDays?: number }): Promise<StokTercepatHabis[]> {
  const qs = new URLSearchParams();
  if (params?.lookbackDays) qs.set("lookbackDays", String(params.lookbackDays));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<StokTercepatHabis[]>(`/analytics/stok-tercepat-habis${suffix}`);
}
