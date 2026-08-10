import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CardBlockSkeleton,
  StatCardSkeleton,
  TableRowsSkeleton,
} from "@/components/dashboard/skeletons";

export default function AkuntansiLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <CardBlockSkeleton titleWidth="w-52" />

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <TableRowsSkeleton rows={4} cols={6} />
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <div className="px-6 pb-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <TableRowsSkeleton rows={8} cols={5} />
      </Card>
    </div>
  );
}
