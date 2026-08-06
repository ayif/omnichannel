"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHANNEL_LABEL, Channel } from "@/lib/types";
import { formatChartDay, formatCompactCurrency, formatCurrency } from "@/lib/format";
import { ChannelDot } from "@/components/dashboard/badges";
import type { DailyChannelRevenue } from "@/lib/api";

const SERIES: { key: keyof Omit<DailyChannelRevenue, "date">; channel: Channel; color: string }[] = [
  { key: "tokopedia", channel: Channel.TOKOPEDIA, color: "var(--chan-tokopedia)" },
  { key: "shopee", channel: Channel.SHOPEE, color: "var(--chan-shopee)" },
  { key: "website", channel: Channel.WEBSITE, color: "var(--chan-website)" },
  { key: "tiktokshop", channel: Channel.TIKTOKSHOP, color: "var(--chan-tiktokshop)" },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-lg border bg-popover p-2.5 text-xs shadow-md">
      <div className="mb-1.5 font-medium text-popover-foreground">
        {label ? formatChartDay(label) : ""}
      </div>
      <div className="flex flex-col gap-1">
        {SERIES.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key);
          if (!item) return null;
          return (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ChannelDot channel={s.channel} />
                {CHANNEL_LABEL[s.channel]}
              </span>
              <span className="font-medium tabular-nums text-popover-foreground">
                {formatCurrency(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SalesTrendChart({ data }: { data: DailyChannelRevenue[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatChartDay}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickMargin={8}
            interval={1}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(v: number) => formatCompactCurrency(v)}
            width={56}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-1">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ChannelDot channel={s.channel} />
            {CHANNEL_LABEL[s.channel]}
          </span>
        ))}
      </div>
    </div>
  );
}
