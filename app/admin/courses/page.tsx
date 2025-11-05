import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CoursesList } from "@/components/admin/courses-list"
import { CreateCourseDialog } from "@/components/admin/create-course-dialog"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <CreateCourseDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </CreateCourseDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>View and manage all courses in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CoursesListSkeleton />}>
            <CoursesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function CoursesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
