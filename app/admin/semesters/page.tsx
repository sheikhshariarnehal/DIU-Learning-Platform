import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SemestersList } from "@/components/admin/semesters-list"
import { CreateSemesterDialog } from "@/components/admin/create-semester-dialog"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SemestersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Semesters</h2>
          <p className="text-muted-foreground">Manage academic semesters and their courses</p>
        </div>
        <CreateSemesterDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Semester
          </Button>
        </CreateSemesterDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Semesters</CardTitle>
          <CardDescription>View and manage all academic semesters</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SemestersListSkeleton />}>
            <SemestersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function SemestersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
