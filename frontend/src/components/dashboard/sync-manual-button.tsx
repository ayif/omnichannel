"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHANNEL_LABEL, type Channel } from "@/lib/types";

export function SyncManualButton({ channel }: { channel: Channel }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    try {
      // Lewat route handler Next.js sendiri (same-origin) supaya token JWT
      // di httpOnly cookie bisa dibaca server-side lalu diteruskan sebagai
      // Authorization header ke backend - browser tidak pernah pegang token.
      const res = await fetch(`/api/sync/${channel}/trigger`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(`Sync ${CHANNEL_LABEL[channel]} dijadwalkan`);
      router.refresh();
    } catch {
      toast.error(`Gagal menjadwalkan sync ${CHANNEL_LABEL[channel]}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="mt-1" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      {pending ? "Menjadwalkan..." : "Sync Manual"}
    </Button>
  );
}
