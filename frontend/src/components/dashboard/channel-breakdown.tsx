import { CHANNEL_LABEL, Channel } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { ChannelLogo } from "@/components/dashboard/channel-logo";
import { cn } from "@/lib/utils";

const CHANNEL_BAR: Record<Channel, string> = {
  [Channel.TOKOPEDIA]: "bg-chan-tokopedia",
  [Channel.SHOPEE]: "bg-chan-shopee",
  [Channel.WEBSITE]: "bg-chan-website",
  [Channel.TIKTOKSHOP]: "bg-chan-tiktokshop",
};

export function ChannelBreakdown({
  data,
}: {
  data: { channel: Channel; total: number }[];
}) {
  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const max = Math.max(...data.map((d) => d.total));

  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => {
        const share = grandTotal ? Math.round((d.total / grandTotal) * 100) : 0;
        const width = max ? (d.total / max) * 100 : 0;
        return (
          <div key={d.channel} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <ChannelLogo channel={d.channel} />
                {d.channel !== Channel.TOKOPEDIA && CHANNEL_LABEL[d.channel]}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-medium tabular-nums">{formatCurrency(d.total)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{share}%</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", CHANNEL_BAR[d.channel])}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
