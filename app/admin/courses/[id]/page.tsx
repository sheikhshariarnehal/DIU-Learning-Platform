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
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      semesters(title, section)
    `)
    .eq("id", params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{course.course_code}</Badge>
            <span className="text-muted-foreground">by {course.teacher_name}</span>
            {course.semesters && (
              <Badge variant="secondary">
                {course.semesters.title} {course.semesters.section && `(${course.semesters.section})`}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Topics</CardTitle>
              <CardDescription>Course topics and their content</CardDescription>
            </div>
            <CreateTopicDialog courseId={params.id}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Topic
              </Button>
            </CreateTopicDialog>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TopicsSkeleton />}>
              <CourseTopics courseId={params.id} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg">Study Tools</CardTitle>
              <CardDescription>Exam materials and resources</CardDescription>
            </div>
            <CreateStudyToolDialog courseId={params.id}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Tool
              </Button>
            </CreateStudyToolDialog>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<StudyToolsSkeleton />}>
              <CourseStudyTools courseId={params.id} />
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
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

function StudyToolsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}
