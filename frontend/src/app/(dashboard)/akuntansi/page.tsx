import { Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { AkuntansiFilter } from "@/components/dashboard/akuntansi-filter";
import { ExportLabaRugiSheet } from "@/components/dashboard/export-laba-rugi-sheet";
import { LabaRugiTrendChart } from "@/components/dashboard/laba-rugi-trend-chart";
import { LabaRugiChannelTable } from "@/components/dashboard/laba-rugi-channel-table";
import { LabaRugiProdukTable } from "@/components/dashboard/laba-rugi-produk-table";
import { getLabaRugi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { Channel, Role } from "@/lib/types";

export default async function AkuntansiPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; startDate?: string; endDate?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }

  const params = await searchParams;
  const channel = params.channel as Channel | undefined;
  const { summary, perChannel, perProduk, trend } = await getLabaRugi({
    channel,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <AkuntansiFilter />
          <ExportLabaRugiSheet
            defaultChannel={params.channel ?? ""}
            defaultStartDate={params.startDate ?? ""}
            defaultEndDate={params.endDate ?? ""}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pendapatan" value={formatCurrency(summary.totalPendapatan)} icon={Wallet} />
        <StatCard label="HPP" value={formatCurrency(summary.hpp)} icon={TrendingDown} />
        <StatCard
          label="Laba Kotor"
          value={formatCurrency(summary.labaKotor)}
          icon={TrendingUp}
          tone={summary.labaKotor >= 0 ? "default" : "critical"}
        />
        <StatCard label="Margin Laba Kotor" value={`${summary.marginPersen}%`} icon={Percent} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Laba Rugi Bulanan</CardTitle>
          <CardDescription>Total pendapatan, HPP, dan laba kotor per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <LabaRugiTrendChart data={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laba Rugi per Channel</CardTitle>
          <CardDescription>Kontribusi pendapatan &amp; laba kotor tiap channel</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <LabaRugiChannelTable data={perChannel} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laba Rugi per Produk</CardTitle>
          <CardDescription>Produk paling menguntungkan berdasarkan laba kotor</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <LabaRugiProdukTable data={perProduk} />
        </CardContent>
      </Card>
    </div>
  );
}
