import { AlertTriangle, CircleDollarSign, Receipt, Wifi } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Penjualan (14 hari)"
          value={formatCompactCurrency(stats.totalPenjualan)}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Total Transaksi"
          value={formatNumber(stats.totalTransaksi)}
          icon={Receipt}
        />
        <StatCard
          label="Produk Stok Menipis"
          value={String(stats.stokMenipis)}
          icon={AlertTriangle}
          tone={stats.stokMenipis > 0 ? "warning" : "default"}
          trend={stats.stokMenipis > 0 ? { value: "perlu restock segera", positive: false } : undefined}
        />
        <StatCard
          label="Channel Bermasalah"
          value={String(stats.channelBermasalah)}
          icon={Wifi}
          tone={stats.channelBermasalah > 0 ? "critical" : "default"}
          trend={
            stats.channelBermasalah > 0
              ? { value: `${stats.channelBermasalah} channel gagal sync`, positive: false }
              : { value: "semua channel normal", positive: true }
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Penjualan</CardTitle>
            <CardDescription>Omzet per channel, 14 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Channel</CardTitle>
            <CardDescription>Kontribusi omzet 14 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelBreakdown data={totals} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>8 transaksi terakhir dari semua channel</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RecentTransactionsTable data={transactions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Sinkronisasi</CardTitle>
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
