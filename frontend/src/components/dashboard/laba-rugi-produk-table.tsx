"use client";

import * as React from "react";
import { Search, TrendingDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SortableTh } from "@/components/dashboard/sortable-th";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { LabaRugiProduk } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;
type SortKey = "namaProduk" | "qty" | "penjualanBarang" | "hpp" | "labaKotor";

export function LabaRugiProdukTable({ data }: { data: LabaRugiProduk[] }) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("labaKotor");
  const [direction, setDirection] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => p.namaProduk.toLowerCase().includes(q));
  }, [data, query]);

  const sorted = React.useMemo(() => {
    const sign = direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "namaProduk") return sign * a.namaProduk.localeCompare(b.namaProduk);
      return sign * (a[sortKey] - b[sortKey]);
    });
  }, [filtered, sortKey, direction]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
    setPage(1);
  }

  return (
    <>
      <div className="px-6 pb-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk..."
            className="h-8 pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="Tidak ada data"
          description={
            query
              ? `Tidak ada produk yang cocok dengan "${query}".`
              : "Belum ada transaksi pada periode/channel yang dipilih."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTh label="Produk" sortKey="namaProduk" active={sortKey === "namaProduk"} direction={direction} onSort={handleSort} />
              <SortableTh label="Qty" sortKey="qty" active={sortKey === "qty"} direction={direction} onSort={handleSort} className="text-right" />
              <SortableTh label="Penjualan" sortKey="penjualanBarang" active={sortKey === "penjualanBarang"} direction={direction} onSort={handleSort} className="text-right" />
              <SortableTh label="HPP" sortKey="hpp" active={sortKey === "hpp"} direction={direction} onSort={handleSort} className="text-right" />
              <SortableTh label="Laba Kotor" sortKey="labaKotor" active={sortKey === "labaKotor"} direction={direction} onSort={handleSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((p) => (
              <TableRow key={p.productId}>
                <TableCell className="font-medium">{p.namaProduk}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(p.qty)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(p.penjualanBarang)}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(p.hpp)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums font-medium",
                    p.labaKotor >= 0 ? "text-status-good" : "text-status-critical"
                  )}
                >
                  {formatCurrency(p.labaKotor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TablePagination page={currentPage} pageCount={pageCount} totalRows={sorted.length} onPageChange={setPage} />
    </>
  );
}
