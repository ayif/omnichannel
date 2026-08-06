import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function CardBlockSkeleton({
  titleWidth = "w-40",
  height = "h-64",
}: {
  titleWidth?: string;
  height?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className={`h-4 ${titleWidth}`} />
        <Skeleton className="mt-1.5 h-3 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  );
}

export function TableRowsSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-3 px-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
