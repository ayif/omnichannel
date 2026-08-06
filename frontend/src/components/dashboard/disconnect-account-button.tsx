"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DisconnectAccountButton({ id, namaToko }: { id: string; namaToko: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      const res = await fetch(`/api/channel-accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`Toko "${namaToko}" diputus`);
      router.refresh();
    } catch {
      toast.error(`Gagal memutus toko "${namaToko}"`);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" disabled={pending} aria-label="Putuskan toko">
            {pending ? <Loader2 className="animate-spin" /> : <Unlink />}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Putuskan koneksi toko?</AlertDialogTitle>
          <AlertDialogDescription>
            Toko &quot;{namaToko}&quot; tidak akan disinkron lagi sampai dihubungkan ulang. Data
            transaksi yang sudah masuk tidak akan dihapus.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Putuskan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
