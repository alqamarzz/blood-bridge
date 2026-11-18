import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg bg-gray-200" />
          <Skeleton className="h-4 w-72 rounded bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-200" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
            <Skeleton className="h-4 w-24 rounded bg-gray-200" />
            <Skeleton className="h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Main section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Skeleton className="h-6 w-36 rounded bg-gray-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
