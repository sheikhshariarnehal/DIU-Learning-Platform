import { notFound } from "next/navigation"
import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseTopics } from "@/components/admin/course-topics"
import { CourseStudyTools } from "@/components/admin/course-study-tools"
import { CreateTopicDialog } from "@/components/admin/create-topic-dialog"
import { CreateStudyToolDialog } from "@/components/admin/create-study-tool-dialog"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      semesters(title, section)
    `)
    .eq("id", id)
    .single()

  if (error || !course) {
    notFound()
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Navigation */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" asChild className="touch-manipulation">
          <Link href="/admin/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Courses</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </div>

      {/* Course Header */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            {course.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
            <Badge variant="outline" className="w-fit text-sm">
              {course.course_code}
            </Badge>
            <span className="text-muted-foreground text-sm sm:text-base">
              by {course.teacher_name}
            </span>
            {course.semesters && (
              <Badge variant="secondary" className="w-fit">
                {course.semesters.title} {course.semesters.section && `(${course.semesters.section})`}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Topics Card */}
        <Card className="card-responsive shadow-modern">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Topics</CardTitle>
              <CardDescription className="text-sm">Course topics and their content</CardDescription>
            </div>
            <CreateTopicDialog courseId={id}>
              <Button size="sm" className="btn-responsive touch-manipulation w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Add Topic</span>
                <span className="hidden sm:inline">Add Topic</span>
              </Button>
            </CreateTopicDialog>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Suspense fallback={<TopicsSkeleton />}>
              <CourseTopics courseId={id} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Study Tools Card */}
        <Card className="card-responsive shadow-modern">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Study Tools</CardTitle>
              <CardDescription className="text-sm">Exam materials and resources</CardDescription>
            </div>
            <CreateStudyToolDialog courseId={id}>
              <Button size="sm" className="btn-responsive touch-manipulation w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Add Tool</span>
                <span className="hidden sm:inline">Add Tool</span>
              </Button>
            </CreateStudyToolDialog>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Suspense fallback={<StudyToolsSkeleton />}>
              <CourseStudyTools courseId={id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TopicsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg animate-pulse">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-xs" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16 sm:w-20" />
        </div>
      ))}
    </div>
  )
}

function StudyToolsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg animate-pulse">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <Skeleton className="h-6 w-16 sm:w-20" />
        </div>
      ))}
    </div>
  )
}
