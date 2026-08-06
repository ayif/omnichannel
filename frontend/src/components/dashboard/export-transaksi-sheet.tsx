"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CHANNEL_LABEL, Channel } from "@/lib/types";

export function ExportTransaksiSheet() {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [channel, setChannel] = React.useState("");

  function handleExport() {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh setelah tanggal akhir");
      return;
    }

    const qs = new URLSearchParams();
    if (channel) qs.set("channel", channel);
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);

    window.location.href = `/api/transactions/export${qs.toString() ? `?${qs.toString()}` : ""}`;
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <Download />
            Export Excel
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Export Rekap Transaksi</SheetTitle>
          <SheetDescription>
            Unduh file .xlsx berisi detail transaksi dan ringkasan per channel &amp; per produk.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-start">Tanggal Mulai</Label>
            <Input
              id="export-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-end">Tanggal Akhir</Label>
            <Input
              id="export-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-channel">Channel</Label>
            <select
              id="export-channel"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
          <p className="text-xs text-muted-foreground">
            Kosongkan tanggal untuk mengunduh seluruh riwayat transaksi.
          </p>
        </div>
        <SheetFooter>
          <Button onClick={handleExport}>
            <Download />
            Unduh Excel
          </Button>
          <SheetClose render={<Button variant="outline">Batal</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
