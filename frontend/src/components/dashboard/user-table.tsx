"use client";

import * as React from "react";
import { Pencil, Plus, Search, UserX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteUserButton } from "@/components/dashboard/delete-user-button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { UserFormDialog } from "@/components/dashboard/user-form-dialog";
import { formatDate } from "@/lib/format";
import { ROLE_LABEL, Role, type AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const ROLE_BADGE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  [Role.ADMIN]: "default",
  [Role.STAFF]: "secondary",
  [Role.GUDANG]: "outline",
};

export function UserTable({ users, currentUserId }: { users: AppUser[]; currentUserId: string }) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="h-8 pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <UserFormDialog
          mode="create"
          trigger={
            <Button size="sm">
              <Plus /> Tambah User
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="User tidak ditemukan"
          description={`Tidak ada user yang cocok dengan "${query}".`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="w-20 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className={cn("font-medium", isSelf && "text-primary")}>
                    {u.nama}
                    {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(Anda)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <UserFormDialog
                        mode="edit"
                        user={u}
                        isSelf={isSelf}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${u.nama}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      {!isSelf && <DeleteUserButton id={u.id} nama={u.nama} />}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <TablePagination page={currentPage} pageCount={pageCount} totalRows={filtered.length} onPageChange={setPage} />
    </>
  );
}
