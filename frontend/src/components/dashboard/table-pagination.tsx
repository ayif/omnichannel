import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TablePagination({
  page,
  pageCount,
  totalRows,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}) {
  if (totalRows === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-6 pt-3 text-xs text-muted-foreground">
      <span>
        Halaman {page} dari {pageCount} &middot; {totalRows} baris
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
