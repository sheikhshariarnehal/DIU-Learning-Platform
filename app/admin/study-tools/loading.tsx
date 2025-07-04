import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 bg-slate-700" />
          <Skeleton className="h-4 w-64 mt-2 bg-slate-700" />
        </div>
        <Skeleton className="h-10 w-32 bg-slate-700" />
      </div>

      {/* Search and Filters Skeleton */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1 bg-slate-700" />
            <Skeleton className="h-10 w-24 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32 bg-slate-700" />
          </CardTitle>
          <Skeleton className="h-4 w-24 bg-slate-700" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-slate-700" />
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-slate-700" />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
