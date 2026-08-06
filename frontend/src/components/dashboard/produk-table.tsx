"use client";

import * as React from "react";
import { PackageX, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductThumbnail } from "@/components/dashboard/product-thumbnail";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SortableTh } from "@/components/dashboard/sortable-th";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;
type SortKey = "namaProduk" | "hargaDasar" | "jumlahStok";

export function ProdukTable({ products }: { products: Product[] }) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("namaProduk");
  const [direction, setDirection] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.namaProduk.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q)
    );
  }, [products, query]);

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
      setDirection("asc");
    }
    setPage(1);
  }

  return (
    <>
      <div className="px-6 pb-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, SKU, atau kategori..."
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
          icon={PackageX}
          title="Produk tidak ditemukan"
          description={`Tidak ada produk yang cocok dengan "${query}".`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Gambar</TableHead>
              <TableHead>SKU</TableHead>
              <SortableTh label="Produk" sortKey="namaProduk" active={sortKey === "namaProduk"} direction={direction} onSort={handleSort} />
              <TableHead>Kategori</TableHead>
              <SortableTh label="Harga Dasar" sortKey="hargaDasar" active={sortKey === "hargaDasar"} direction={direction} onSort={handleSort} className="text-right" />
              <SortableTh label="Stok" sortKey="jumlahStok" active={sortKey === "jumlahStok"} direction={direction} onSort={handleSort} className="text-right" />
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((p) => {
              const menipis = p.jumlahStok <= p.stokMinimum;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <ProductThumbnail src={p.gambarUrl} alt={p.namaProduk} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.namaProduk}</TableCell>
                  <TableCell className="text-muted-foreground">{p.kategori}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(p.hargaDasar)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums font-medium",
                      menipis && "text-status-warning"
                    )}
                  >
                    {formatNumber(p.jumlahStok)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "border-transparent font-normal",
                        menipis
                          ? "bg-status-warning/15 text-status-warning"
                          : "bg-status-good/15 text-status-good"
                      )}
                    >
                      {menipis ? "Stok Menipis" : "Aman"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <TablePagination page={currentPage} pageCount={pageCount} totalRows={sorted.length} onPageChange={setPage} />
    </>
  );
}
