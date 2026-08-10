"use client";

import * as React from "react";
import { History, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditActionBadge } from "@/components/dashboard/badges";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

const PAGE_SIZE = 10;

export function AuditLogTable({ data }: { data: AuditLog[] }) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (log) =>
        log.description.toLowerCase().includes(q) ||
        (log.userNama ?? "").toLowerCase().includes(q) ||
        (log.userEmail ?? "").toLowerCase().includes(q)
    );
  }, [data, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="px-6 pb-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari deskripsi atau pelaku..."
            className="h-8 pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada aktivitas"
          description={
            query
              ? `Tidak ada entri yang cocok dengan "${query}".`
              : "Belum ada aktivitas yang tercatat pada periode/filter yang dipilih."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Pelaku</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell>
                  <AuditActionBadge action={log.action} />
                </TableCell>
                <TableCell>
                  {log.userNama ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{log.userNama}</span>
                      <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sistem</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{log.description}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.ipAddress ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TablePagination page={currentPage} pageCount={pageCount} totalRows={filtered.length} onPageChange={setPage} />
    </>
  );
}
