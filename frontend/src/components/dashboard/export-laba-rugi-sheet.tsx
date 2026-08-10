"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";
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

export function ExportLabaRugiSheet({
  defaultStartDate = "",
  defaultEndDate = "",
  defaultChannel = "",
}: {
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultChannel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  const [endDate, setEndDate] = React.useState(defaultEndDate);
  const [channel, setChannel] = React.useState(defaultChannel);

  function buildQuery() {
    const qs = new URLSearchParams();
    if (channel) qs.set("channel", channel);
    if (startDate) qs.set("startDate", startDate);
    if (endDate) qs.set("endDate", endDate);
    return qs.toString();
  }

  function handleExport() {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh setelah tanggal akhir");
      return;
    }

    const qs = buildQuery();
    window.location.href = `/api/accounting/export${qs ? `?${qs}` : ""}`;
    setOpen(false);
  }

  function handleExportPdf() {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Tanggal mulai tidak boleh setelah tanggal akhir");
      return;
    }

    const qs = buildQuery();
    window.location.href = `/api/accounting/export-pdf${qs ? `?${qs}` : ""}`;
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
          <SheetTitle>Export Laporan Laba Rugi</SheetTitle>
          <SheetDescription>
            Unduh file .xlsx berisi ringkasan, rekap per channel, per produk, dan tren bulanan.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-lr-start">Tanggal Mulai</Label>
            <Input
              id="export-lr-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-lr-end">Tanggal Akhir</Label>
            <Input
              id="export-lr-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="export-lr-channel">Channel</Label>
            <select
              id="export-lr-channel"
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
            Kosongkan tanggal untuk mengunduh laporan dari seluruh riwayat transaksi.
          </p>
        </div>
        <SheetFooter>
          <Button onClick={handleExport}>
            <Download />
            Unduh Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <FileText />
            Unduh PDF
          </Button>
          <SheetClose render={<Button variant="outline">Batal</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
