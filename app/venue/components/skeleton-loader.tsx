import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonCardProps {
  type?: "stats" | "list" | "calendar" | "chart"
}

export function SkeletonCard({ type = "stats" }: SkeletonCardProps) {
  if (type === "stats") {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-20 mt-4" />
      </div>
    )
  }

  if (type === "list") {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  if (type === "calendar") {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array(35)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
        </div>
      </div>
    )
  }

  if (type === "chart") {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return null
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonCard type="stats" />
        <SkeletonCard type="stats" />
        <SkeletonCard type="stats" />
        <SkeletonCard type="stats" />
      </div>

      <SkeletonCard type="chart" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard type="list" />
        <SkeletonCard type="list" />
      </div>

      <SkeletonCard type="calendar" />
    </div>
  )
}
