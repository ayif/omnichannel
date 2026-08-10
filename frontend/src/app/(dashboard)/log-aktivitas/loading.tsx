import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRowsSkeleton } from "@/components/dashboard/skeletons";

export default function LogAktivitasLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <Skeleton className="h-8 w-full max-w-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <div className="px-6 pb-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <TableRowsSkeleton rows={8} cols={5} />
      </Card>
    </div>
  );
}
