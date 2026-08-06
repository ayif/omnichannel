import { ReceiptText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChannelBadge, TransactionStatusBadge } from "@/components/dashboard/badges";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function RecentTransactionsTable({ data }: { data: Transaction[] }) {
  if (data.length === 0) {
    return <EmptyState icon={ReceiptText} title="Belum ada transaksi" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Waktu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <ChannelBadge channel={t.channel} />
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {t.channelOrderId}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{t.namaProduk}</span>
                <span className="text-xs text-muted-foreground">{t.qty} unit</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(t.hargaJual * t.qty + t.ongkosKirim)}
            </TableCell>
            <TableCell>
              <TransactionStatusBadge status={t.status} />
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {formatRelativeTime(t.tanggalTransaksi)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
