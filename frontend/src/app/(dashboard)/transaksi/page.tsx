import { Clock, Receipt, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransaksiTable } from "@/components/dashboard/transaksi-table";
import { ExportTransaksiSheet } from "@/components/dashboard/export-transaksi-sheet";
import { getTransactions } from "@/lib/api";
import { Role, TransactionStatus } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";

export default async function TransaksiPage() {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }

  const transactions = await getTransactions();
  const totalOmzet = transactions.reduce(
    (s, t) => s + t.hargaJual * t.qty + t.ongkosKirim,
    0
  );
  const pendingCount = transactions.filter(
    (t) => t.status === TransactionStatus.PENDING
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Transaksi" value={formatNumber(transactions.length)} icon={Receipt} />
        <StatCard label="Total Omzet" value={formatCurrency(totalOmzet)} icon={Wallet} />
        <StatCard
          label="Menunggu Pembayaran"
          value={formatNumber(pendingCount)}
          icon={Clock}
          tone={pendingCount > 0 ? "warning" : "default"}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Transaksi</CardTitle>
          <ExportTransaksiSheet />
        </CardHeader>
        <CardContent className="px-0">
          <TransaksiTable transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
