"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function SortableTh<K extends string>({
  label,
  sortKey,
  active,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: K;
  active: boolean;
  direction: "asc" | "desc";
  onSort: (key: K) => void;
  className?: string;
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1 hover:text-foreground",
          !active && "text-muted-foreground",
          className?.includes("text-right") && "ml-auto"
        )}
      >
        {label}
        <Icon className={cn("size-3", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}
