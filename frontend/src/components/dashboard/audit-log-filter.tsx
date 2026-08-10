"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUDIT_ACTION_LABEL, AuditAction } from "@/lib/types";

export function AuditLogFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = React.useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = React.useState(searchParams.get("endDate") ?? "");
  const [action, setAction] = React.useState(searchParams.get("action") ?? "");

  function applyFilter() {
    const qs = new URLSearchParams();
    if (action) qs.set("action", action);
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);
    router.push(`/log-aktivitas${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  function resetFilter() {
    setStartDate("");
    setEndDate("");
    setAction("");
    router.push("/log-aktivitas");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-start" className="text-xs text-muted-foreground">
          Tanggal Mulai
        </Label>
        <Input
          id="audit-start"
          type="date"
          className="h-8"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-end" className="text-xs text-muted-foreground">
          Tanggal Akhir
        </Label>
        <Input
          id="audit-end"
          type="date"
          className="h-8"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audit-action" className="text-xs text-muted-foreground">
          Aksi
        </Label>
        <select
          id="audit-action"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">Semua Aksi</option>
          {Object.values(AuditAction).map((a) => (
            <option key={a} value={a}>
              {AUDIT_ACTION_LABEL[a]}
            </option>
          ))}
        </select>
      </div>
      <Button size="sm" onClick={applyFilter}>
        <Filter />
        Terapkan
      </Button>
      <Button size="sm" variant="ghost" onClick={resetFilter}>
        <RotateCcw />
        Reset
      </Button>
    </div>
  );
}
