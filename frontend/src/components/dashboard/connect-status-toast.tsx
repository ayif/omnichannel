"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CHANNEL_LABEL, type Channel } from "@/lib/types";

/**
 * Menampilkan toast sukses/gagal berdasarkan query param `?connected=`/`?error=`
 * dari redirect callback OAuth, lalu bersihkan URL supaya toast tidak muncul
 * lagi kalau halaman di-refresh manual.
 */
export function ConnectStatusToast({
  connected,
  error,
}: {
  connected?: string;
  error?: string;
}) {
  const router = useRouter();

  React.useEffect(() => {
    if (connected) {
      const label = CHANNEL_LABEL[connected as Channel] ?? connected;
      toast.success(`Toko ${label} berhasil terhubung`);
    }
    if (error) {
      toast.error(error);
    }
    if (connected || error) {
      router.replace("/sinkronisasi");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, error]);

  return null;
}
