import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
  trend?: { value: string; positive: boolean };
  tone?: "default" | "warning" | "critical";
}

const TONE_STYLE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-status-warning/15 text-status-warning",
  critical: "bg-status-critical/15 text-status-critical",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  trend,
  tone = "default",
}: StatCardProps) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm shadow-slate-900/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/[0.06]">
      <CardContent className="flex min-h-32 items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
          {trend && (
            <span
              className={cn(
                "mt-1 inline-flex w-fit items-center gap-0.5 text-xs font-medium",
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
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", TONE_STYLE[tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
