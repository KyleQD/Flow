import { Skeleton } from "@/components/ui/skeleton"

export default function TeamsLoading() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Skeleton className="h-[calc(100vh-200px)] w-full" />
        <div className="md:col-span-3 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[calc(100vh-300px)] w-full" />
        </div>
      </div>
    </div>
  )
}
