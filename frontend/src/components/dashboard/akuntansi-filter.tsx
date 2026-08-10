"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHANNEL_LABEL, Channel } from "@/lib/types";

export function AkuntansiFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = React.useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = React.useState(searchParams.get("endDate") ?? "");
  const [channel, setChannel] = React.useState(searchParams.get("channel") ?? "");

  function applyFilter() {
    const qs = new URLSearchParams();
    if (channel) qs.set("channel", channel);
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);
    router.push(`/akuntansi${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  function resetFilter() {
    setStartDate("");
    setEndDate("");
    setChannel("");
    router.push("/akuntansi");
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="laba-start" className="text-xs text-muted-foreground">
          Tanggal Mulai
        </Label>
        <Input
          id="laba-start"
          type="date"
          className="h-8"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="laba-end" className="text-xs text-muted-foreground">
          Tanggal Akhir
        </Label>
        <Input
          id="laba-end"
          type="date"
          className="h-8"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="laba-channel" className="text-xs text-muted-foreground">
          Channel
        </Label>
        <select
          id="laba-channel"
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="">Semua Channel</option>
          {Object.values(Channel).map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABEL[c]}
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
