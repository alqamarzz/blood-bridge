import { Skeleton } from "@/components/ui/skeleton";

export default function FindBloodLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-lg bg-gray-200" />
          <Skeleton className="h-4 w-96 rounded bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg bg-gray-200" />
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-32 rounded bg-gray-200 mr-2" />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Skeleton key={i} className="h-7 w-14 rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Cards Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-16 rounded-full bg-red-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded bg-gray-200" />
              <Skeleton className="h-4 w-36 rounded bg-gray-100" />
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded bg-gray-200" />
              <Skeleton className="h-8 w-24 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
