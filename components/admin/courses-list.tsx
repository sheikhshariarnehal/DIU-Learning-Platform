import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, BookOpen } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export async function CoursesList() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      *,
      semesters(title, section),
      topics(count)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading courses: {error.message}</div>
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No courses found. Create your first course to get started.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Semester</TableHead>
          <TableHead>Topics</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="font-medium">{course.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{course.course_code}</Badge>
            </TableCell>
            <TableCell>{course.teacher_name}</TableCell>
            <TableCell>
              {course.semesters ? (
                <div>
                  <div className="font-medium">{course.semesters.title}</div>
                  {course.semesters.section && (
                    <div className="text-sm text-muted-foreground">Section: {course.semesters.section}</div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">No semester</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{Array.isArray(course.topics) ? course.topics.length : 0} topics</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(course.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/courses/${course.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
