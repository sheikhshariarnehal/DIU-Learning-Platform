import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, BookOpen, Star } from "lucide-react"
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
    .order("is_highlighted", { ascending: false })
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
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
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
              <TableRow key={course.id} className={course.is_highlighted ? 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/20' : ''}>
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
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {courses.map((course) => (
            <div key={course.id} className={`bg-card border rounded-lg shadow-modern transition-all duration-300 ${
              course.is_highlighted
                ? 'border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 shadow-lg'
                : 'border-border hover:shadow-lg'
            }`}>
              <div className="p-4 rounded-lg">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg truncate ${
                        course.is_highlighted ? 'text-gray-900 dark:text-white' : ''
                      }`}>
                        {course.title}
                      </h3>
                      {course.is_highlighted && (
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={course.is_highlighted ? "secondary" : "outline"}
                        className={`text-xs font-medium ${
                          course.is_highlighted
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : ''
                        }`}
                      >
                        {course.course_code}
                      </Badge>
                      <span className={`text-sm ${
                        course.is_highlighted
                          ? 'text-gray-700 dark:text-gray-300 font-medium'
                          : 'text-muted-foreground'
                      }`}>
                        by {course.teacher_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {course.semesters && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Semester:</span>
                      <Badge variant="secondary" className="text-xs">
                        {course.semesters.title} {course.semesters.section && `(${course.semesters.section})`}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Topics:</span>
                        <Badge variant="secondary" className="text-xs">
                          {Array.isArray(course.topics) ? course.topics.length : 0}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="flex-1 touch-manipulation">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="touch-manipulation">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 touch-manipulation">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
}
