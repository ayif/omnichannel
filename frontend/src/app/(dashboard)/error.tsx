"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-status-critical/15 text-status-critical">
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="font-heading text-lg font-semibold">Gagal memuat data</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tidak bisa terhubung ke backend API. Pastikan service <code>backend</code> jalan, lalu coba lagi.
      </p>
      <p className="max-w-sm font-mono text-xs text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-2">
        Coba Lagi
      </Button>
    </div>
  );
}
