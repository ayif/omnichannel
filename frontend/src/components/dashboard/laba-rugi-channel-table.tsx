import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChannelBadge } from "@/components/dashboard/badges";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { LabaRugiChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LabaRugiChannelTable({ data }: { data: LabaRugiChannel[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Channel</TableHead>
          <TableHead className="text-right">Pendapatan</TableHead>
          <TableHead className="text-right">HPP</TableHead>
          <TableHead className="text-right">Laba Kotor</TableHead>
          <TableHead className="text-right">Margin</TableHead>
          <TableHead className="text-right">Transaksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.channel}>
            <TableCell>
              <ChannelBadge channel={row.channel} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatCurrency(row.totalPendapatan)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatCurrency(row.hpp)}
            </TableCell>
            <TableCell
              className={cn(
                "text-right tabular-nums font-medium",
                row.labaKotor >= 0 ? "text-status-good" : "text-status-critical"
              )}
            >
              {formatCurrency(row.labaKotor)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.marginPersen}%
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatNumber(row.jumlahTransaksi)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
