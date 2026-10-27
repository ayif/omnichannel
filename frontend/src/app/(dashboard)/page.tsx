import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  Receipt,
  Wifi,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { ChannelBreakdown } from "@/components/dashboard/channel-breakdown";
import { RecentTransactionsTable } from "@/components/dashboard/recent-transactions-table";
import { SyncStatusList } from "@/components/dashboard/sync-status-list";
import {
  getChannelTotals,
  getDashboardStats,
  getSalesTrend,
  getSyncLogs,
  getTransactions,
} from "@/lib/api";
import { formatCompactCurrency, formatNumber } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }

  const [stats, trend, totals, transactions, syncLogs] = await Promise.all([
    getDashboardStats(),
    getSalesTrend(),
    getChannelTotals(),
    getTransactions({ limit: 8 }),
    getSyncLogs(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            <span className="size-2 rounded-full bg-primary" />
            Pusat kendali penjualan
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ringkasan bisnis
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Pantau performa penjualan, persediaan, dan koneksi channel Anda dalam satu tempat.
          </p>
        </div>
        <Link
          href="/transaksi"
          className="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          Lihat transaksi
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penjualan"
          value={formatCompactCurrency(stats.totalPenjualan)}
          icon={CircleDollarSign}
          detail="14 hari terakhir"
        />
        <StatCard
          label="Total Transaksi"
          value={formatNumber(stats.totalTransaksi)}
          icon={Receipt}
          detail="Semua channel"
        />
        <StatCard
          label="Produk Stok Menipis"
          value={String(stats.stokMenipis)}
          icon={AlertTriangle}
          tone={stats.stokMenipis > 0 ? "warning" : "default"}
          detail="Perlu perhatian"
          trend={stats.stokMenipis > 0 ? { value: "perlu restock segera", positive: false } : undefined}
        />
        <StatCard
          label="Channel Bermasalah"
          value={String(stats.channelBermasalah)}
          icon={Wifi}
          tone={stats.channelBermasalah > 0 ? "critical" : "default"}
          detail="Status sinkronisasi"
          trend={
            stats.channelBermasalah > 0
              ? { value: `${stats.channelBermasalah} channel gagal sync`, positive: false }
              : { value: "semua channel normal", positive: true }
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-900/[0.03] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Tren penjualan</CardTitle>
            <CardDescription>Omzet per channel, 14 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-900/[0.03]">
          <CardHeader>
            <CardTitle className="text-lg">Perbandingan channel</CardTitle>
            <CardDescription>Kontribusi omzet 14 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelBreakdown data={totals} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-900/[0.03] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transaksi terbaru</CardTitle>
            <CardDescription>8 transaksi terakhir dari semua channel</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RecentTransactionsTable data={transactions} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-900/[0.03]">
          <CardHeader>
            <CardTitle className="text-lg">Status sinkronisasi</CardTitle>
            <CardDescription>Sync terakhir per channel</CardDescription>
          </CardHeader>
          <CardContent>
            <SyncStatusList data={syncLogs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
