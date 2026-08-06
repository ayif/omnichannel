import { StatCardSkeleton, CardBlockSkeleton } from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardBlockSkeleton titleWidth="w-32" height="h-72" />
        </div>
        <CardBlockSkeleton titleWidth="w-40" height="h-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardBlockSkeleton titleWidth="w-36" height="h-56" />
        </div>
        <CardBlockSkeleton titleWidth="w-32" height="h-56" />
      </div>
    </div>
  );
}
