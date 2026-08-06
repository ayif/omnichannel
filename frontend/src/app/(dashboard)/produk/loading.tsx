import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton, TableRowsSkeleton } from "@/components/dashboard/skeletons";

export default function ProdukLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <div className="px-6 pb-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <TableRowsSkeleton rows={8} cols={6} />
      </Card>
    </div>
  );
}
