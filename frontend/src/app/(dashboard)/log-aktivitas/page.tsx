import { History } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditLogFilter } from "@/components/dashboard/audit-log-filter";
import { AuditLogTable } from "@/components/dashboard/audit-log-table";
import { getAuditLogs } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { AuditAction, Role } from "@/lib/types";

export default async function LogAktivitasPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; startDate?: string; endDate?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === Role.GUDANG) {
    redirect("/produk");
  }
  if (user?.role === Role.STAFF) {
    redirect("/");
  }

  const params = await searchParams;
  const logs = await getAuditLogs({
    action: params.action as AuditAction | undefined,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AuditLogFilter />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4" />
            Log Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <AuditLogTable data={logs} />
        </CardContent>
      </Card>
    </div>
  );
}
