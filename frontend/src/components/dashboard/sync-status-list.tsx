import { AlertTriangle } from "lucide-react";

import { CHANNEL_LABEL } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { ChannelDot, SyncStatusBadge } from "@/components/dashboard/badges";
import type { SyncLog } from "@/lib/types";

export function SyncStatusList({ data }: { data: SyncLog[] }) {
  return (
    <div className="flex flex-col divide-y">
      {data.map((log) => (
        <div key={log.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <ChannelDot channel={log.channel} />
              {CHANNEL_LABEL[log.channel]}
            </span>
            <span className="text-xs text-muted-foreground">
              {log.jumlahDataDitarik} order ditarik &middot; {formatRelativeTime(log.waktuSelesai ?? log.waktuMulai)}
            </span>
            {log.errorMessage && (
              <span className="flex items-center gap-1 text-xs text-status-critical">
                <AlertTriangle className="size-3" />
                {log.errorMessage}
              </span>
            )}
          </div>
          <SyncStatusBadge status={log.status} />
        </div>
      ))}
    </div>
  );
}
