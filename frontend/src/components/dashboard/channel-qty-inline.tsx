import { ChannelDot } from "@/components/dashboard/badges";
import { formatNumber } from "@/lib/format";
import type { ChannelQty } from "@/lib/types";

export function ChannelQtyInline({ data }: { data: ChannelQty[] }) {
  if (data.length === 0) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const sorted = [...data].sort((a, b) => b.qty - a.qty);

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {sorted.map((c) => (
        <span key={c.channel} className="flex items-center gap-1 text-xs text-muted-foreground">
          <ChannelDot channel={c.channel} />
          {formatNumber(c.qty)}
        </span>
      ))}
    </div>
  );
}
