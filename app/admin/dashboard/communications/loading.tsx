import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <Skeleton className="h-10 w-full max-w-3xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
      </div>
    </div>
  )
}
