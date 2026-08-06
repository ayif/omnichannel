import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  tone?: "default" | "warning" | "critical";
}

const TONE_STYLE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-accent text-accent-foreground",
  warning: "bg-status-warning/15 text-status-warning",
  critical: "bg-status-critical/15 text-status-critical",
};

export function StatCard({ label, value, icon: Icon, trend, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex w-fit items-center gap-0.5 text-xs font-medium",
                trend.positive ? "text-status-good" : "text-status-critical"
              )}
            >
              {trend.positive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", TONE_STYLE[tone])}>
          <Icon className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
