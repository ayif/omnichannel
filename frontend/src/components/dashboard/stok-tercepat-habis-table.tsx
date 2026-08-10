import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChannelQtyInline } from "@/components/dashboard/channel-qty-inline";
import { formatNumber } from "@/lib/format";
import type { StokTercepatHabis } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

function severityStyle(hari: number | null): string {
  if (hari === null) return "bg-accent text-accent-foreground";
  if (hari < 7) return "bg-status-critical/15 text-status-critical";
  if (hari < 14) return "bg-status-warning/15 text-status-warning";
  return "bg-status-good/15 text-status-good";
}

export function StokTercepatHabisTable({ data }: { data: StokTercepatHabis[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="Belum ada data"
        description="Belum ada penjualan dalam 30 hari terakhir yang bisa dipakai untuk memproyeksikan kecepatan stok habis."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Stok Saat Ini</TableHead>
          <TableHead className="text-right">Rata-rata/Hari</TableHead>
          <TableHead>Perkiraan Habis</TableHead>
          <TableHead>Per Channel (30 hari)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p, i) => (
          <TableRow key={p.productId}>
            <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
            <TableCell className="font-medium">{p.namaProduk}</TableCell>
            <TableCell className="text-right tabular-nums">{formatNumber(p.stokSaatIni)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {p.avgPerHari.toFixed(1)}
            </TableCell>
            <TableCell>
              <Badge className={cn("border-transparent font-normal", severityStyle(p.perkiraanHariTersisa))}>
                {p.perkiraanHariTersisa === null
                  ? "Tidak dapat diprediksi"
                  : `± ${Math.round(p.perkiraanHariTersisa)} hari lagi`}
              </Badge>
            </TableCell>
            <TableCell>
              <ChannelQtyInline data={p.perChannel} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
