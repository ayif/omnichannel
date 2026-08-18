"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABEL, Role, type AppUser } from "@/lib/types";

export function UserFormDialog({
  mode,
  user,
  isSelf,
  trigger,
}: {
  mode: "create" | "edit";
  user?: AppUser;
  isSelf?: boolean;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const url = mode === "create" ? "/api/users" : `/api/users/${user?.id}`;
    const body: Record<string, string> = {
      nama: String(formData.get("nama")),
      email: String(formData.get("email")),
      role: String(formData.get("role")),
    };
    if (mode === "create") {
      body.password = String(formData.get("password"));
    }

    try {
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan user");

      toast.success(mode === "create" ? "User berhasil ditambahkan" : "User berhasil diubah");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan user");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah User" : "Ubah User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Buat akun baru untuk anggota tim"
              : `Ubah data akun ${user?.nama}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-nama">Nama</Label>
            <Input id="user-nama" name="nama" defaultValue={user?.nama} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" name="email" type="email" defaultValue={user?.email} required />
          </div>
          {mode === "create" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-password">Password</Label>
              <Input id="user-password" name="password" type="password" minLength={6} required />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-role">Role</Label>
            <select
              id="user-role"
              name="role"
              defaultValue={user?.role ?? Role.STAFF}
              disabled={isSelf}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            >
              {Object.values(Role).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            {isSelf && (
              <p className="text-xs text-muted-foreground">Tidak bisa mengubah role akun sendiri</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Batal</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
