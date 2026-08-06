import { Link2, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChannelDot, SyncStatusBadge } from "@/components/dashboard/badges";
import { SyncManualButton } from "@/components/dashboard/sync-manual-button";
import { DisconnectAccountButton } from "@/components/dashboard/disconnect-account-button";
import { ConnectStatusToast } from "@/components/dashboard/connect-status-toast";
import { getChannelAccounts, getSyncLogs } from "@/lib/api";
import { CHANNEL_ACCOUNT_STATUS_LABEL, CHANNEL_LABEL, Channel, ChannelAccountStatus, Role } from "@/lib/types";
import { formatDateTime, formatNumber, formatRelativeTime } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const CONNECTABLE_CHANNELS = [Channel.TOKOPEDIA, Channel.SHOPEE, Channel.TIKTOKSHOP] as const;

export default async function SinkronisasiPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }

  const [syncLogs, channelAccounts, params] = await Promise.all([
    getSyncLogs(),
    getChannelAccounts(),
    searchParams,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <ConnectStatusToast connected={params.connected} error={params.error} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            Toko Terhubung
          </CardTitle>
          <CardDescription>
            Satu channel bisa punya lebih dari satu toko - tiap toko dihubungkan lewat OAuth resmi
            marketplace, token disimpan terenkripsi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CONNECTABLE_CHANNELS.map((channel) => {
              const accounts = channelAccounts.filter((a) => a.channel === channel);
              return (
                <Card key={channel} className="bg-muted/30">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ChannelDot channel={channel} />
                        {CHANNEL_LABEL[channel]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {accounts.length} toko
                      </span>
                    </div>

                    {accounts.length > 0 && (
                      <div className="flex flex-col divide-y">
                        {accounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{account.namaToko}</span>
                              <span className="text-xs text-muted-foreground">
                                ID: {account.shopId}
                                {account.expiresAt && ` · exp ${formatRelativeTime(account.expiresAt)}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge
                                className={cn(
                                  "border-transparent font-normal",
                                  account.status === ChannelAccountStatus.CONNECTED
                                    ? "bg-status-good/15 text-status-good"
                                    : "bg-status-warning/15 text-status-warning"
                                )}
                              >
                                {CHANNEL_ACCOUNT_STATUS_LABEL[account.status]}
                              </Badge>
                              <DisconnectAccountButton id={account.id} namaToko={account.namaToko} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      nativeButton={false}
                      render={<a href={`/api/channel-accounts/connect/${channel}`} />}
                    >
                      <Link2 /> Hubungkan Toko {CHANNEL_LABEL[channel]}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Sinkronisasi</CardTitle>
          <CardDescription>
            Pull terjadwal tiap 10 menit untuk Tokopedia & Shopee. Website tersinkron lewat webhook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {syncLogs.map((log) => (
              <Card key={log.id} className="bg-muted/30">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ChannelDot channel={log.channel} />
                      {CHANNEL_LABEL[log.channel]}
                    </span>
                    <SyncStatusBadge status={log.status} />
                  </div>
                  <dl className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <dt>Order ditarik</dt>
                      <dd className="font-medium text-foreground">
                        {formatNumber(log.jumlahDataDitarik)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Terakhir sync</dt>
                      <dd className="font-medium text-foreground">
                        {formatRelativeTime(log.waktuSelesai ?? log.waktuMulai)}
                      </dd>
                    </div>
                  </dl>
                  {log.errorMessage && (
                    <p className="rounded-md bg-status-critical/10 px-2 py-1.5 text-xs text-status-critical">
                      {log.errorMessage}
                    </p>
                  )}
                  <SyncManualButton channel={log.channel} />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Sinkronisasi</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y px-6">
          {syncLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2">
                <ChannelDot channel={log.channel} />
                <span className="text-sm font-medium">{CHANNEL_LABEL[log.channel]}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(log.waktuMulai)}
                  {log.waktuSelesai ? ` – ${formatDateTime(log.waktuSelesai)}` : ""}
                </span>
              </div>
              <SyncStatusBadge status={log.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
