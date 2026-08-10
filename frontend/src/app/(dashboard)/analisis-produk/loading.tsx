import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRowsSkeleton } from "@/components/dashboard/skeletons";

export default function AnalisisProdukLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <Skeleton className="h-8 w-full max-w-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <TableRowsSkeleton rows={6} cols={5} />
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <TableRowsSkeleton rows={6} cols={6} />
      </Card>
    </div>
  );
}
