import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChannelQtyInline } from "@/components/dashboard/channel-qty-inline";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { ProdukTerlaris } from "@/lib/types";
import { TrendingUp } from "lucide-react";

export function ProdukTerlarisTable({ data }: { data: ProdukTerlaris[] }) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Belum ada data"
        description="Belum ada transaksi pada periode/channel yang dipilih."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Produk</TableHead>
          <TableHead className="text-right">Qty Terjual</TableHead>
          <TableHead className="text-right">Omzet</TableHead>
          <TableHead>Per Channel</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p, i) => (
          <TableRow key={p.productId}>
            <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
            <TableCell className="font-medium">{p.namaProduk}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">{formatNumber(p.qtyTerjual)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {formatCurrency(p.omzet)}
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
