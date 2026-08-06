"use client";

import * as React from "react";
import { ReceiptText, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChannelBadge, TransactionStatusBadge } from "@/components/dashboard/badges";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SortableTh } from "@/components/dashboard/sortable-th";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { CHANNEL_LABEL, Channel, type Transaction } from "@/lib/types";

const TABS: { value: string; label: string; channel?: Channel }[] = [
  { value: "all", label: "Semua" },
  { value: Channel.TOKOPEDIA, label: CHANNEL_LABEL[Channel.TOKOPEDIA], channel: Channel.TOKOPEDIA },
  { value: Channel.SHOPEE, label: CHANNEL_LABEL[Channel.SHOPEE], channel: Channel.SHOPEE },
  { value: Channel.WEBSITE, label: CHANNEL_LABEL[Channel.WEBSITE], channel: Channel.WEBSITE },
  { value: Channel.TIKTOKSHOP, label: CHANNEL_LABEL[Channel.TIKTOKSHOP], channel: Channel.TIKTOKSHOP },
];

const PAGE_SIZE = 8;
type SortKey = "total" | "tanggalTransaksi";

function totalOf(t: Transaction) {
  return t.hargaJual * t.qty + t.ongkosKirim;
}

export function TransaksiTable({ transactions }: { transactions: Transaction[] }) {
  const [tab, setTab] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("tanggalTransaksi");
  const [direction, setDirection] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

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
    <Tabs
      value={tab}
      onValueChange={(v) => {
        setTab(v);
        setPage(1);
      }}
      className="gap-4"
    >
      <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="w-fit">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="relative max-w-xs sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari order ID atau produk..."
            className="h-8 pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          <TabPanel
            data={transactions.filter((x) => !t.channel || x.channel === t.channel)}
            query={query}
            sortKey={sortKey}
            direction={direction}
            page={page}
            onSort={handleSort}
            onPageChange={setPage}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function TabPanel({
  data,
  query,
  sortKey,
  direction,
  page,
  onSort,
  onPageChange,
}: {
  data: Transaction[];
  query: string;
  sortKey: SortKey;
  direction: "asc" | "desc";
  page: number;
  onSort: (key: SortKey) => void;
  onPageChange: (page: number) => void;
}) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (t) =>
        t.channelOrderId.toLowerCase().includes(q) ||
        t.namaProduk.toLowerCase().includes(q)
    );
  }, [data, query]);

  const sorted = React.useMemo(() => {
    const sign = direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "total") return sign * (totalOf(a) - totalOf(b));
      return sign * (new Date(a.tanggalTransaksi).getTime() - new Date(b.tanggalTransaksi).getTime());
    });
  }, [filtered, sortKey, direction]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Belum ada transaksi"
        description={query ? `Tidak ada transaksi yang cocok dengan "${query}".` : "Belum ada transaksi masuk untuk channel ini."}
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Produk</TableHead>
            <SortableTh label="Total" sortKey="total" active={sortKey === "total"} direction={direction} onSort={onSort} className="text-right" />
            <TableHead>Status</TableHead>
            <SortableTh label="Waktu" sortKey="tanggalTransaksi" active={sortKey === "tanggalTransaksi"} direction={direction} onSort={onSort} className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((t) => (
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
                {formatCurrency(totalOf(t))}
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
      <TablePagination page={currentPage} pageCount={pageCount} totalRows={sorted.length} onPageChange={onPageChange} />
    </>
  );
}
