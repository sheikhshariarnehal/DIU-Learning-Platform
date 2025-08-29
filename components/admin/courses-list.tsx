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
        <div className="lg:hidden space-y-6">
          {courses.map((course) => (
            <div key={course.id} className={`bg-card border rounded-xl transition-all duration-500 ease-out relative overflow-hidden ${
              course.is_highlighted
                ? `border-l-4 border-l-blue-500 dark:border-l-[#50727B]
                   bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30
                   border border-blue-200/60
                   shadow-[0_4px_12px_-2px_rgba(59,130,246,0.2),0_8px_24px_-4px_rgba(59,130,246,0.1)]
                   hover:shadow-[0_12px_32px_-4px_rgba(59,130,246,0.3),0_8px_24px_-8px_rgba(59,130,246,0.15)]
                   hover:border-blue-300/70 hover:-translate-y-1
                   dark:bg-gradient-to-br dark:from-[#35374B]/90 dark:via-[#344955]/70 dark:to-[#50727B]/40
                   dark:border-[#50727B]/60 dark:shadow-[0_6px_16px_-4px_rgba(80,114,123,0.5),0_12px_32px_-8px_rgba(53,55,75,0.6)]
                   dark:hover:shadow-[0_16px_40px_-8px_rgba(80,114,123,0.7),0_20px_48px_-12px_rgba(53,55,75,0.7)]
                   dark:hover:border-[#50727B]/80 dark:hover:shadow-[0_0_40px_rgba(80,114,123,0.4)]`
                : 'border-border hover:shadow-lg dark:hover:shadow-[0_4px_12px_-2px_rgba(53,55,75,0.4)]'
            }`}>
              <div className="p-6 rounded-lg relative">
                {/* Subtle top accent line for highlighted courses */}
                {course.is_highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-[#50727B]/70"></div>
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-bold text-xl truncate tracking-tight ${
                          course.is_highlighted ? 'text-slate-800 dark:text-slate-100' : ''
                        }`}>
                          {course.title}
                        </h3>
                        {course.is_highlighted && (
                          <Star className="h-5 w-5 text-[#78A083] fill-[#78A083] drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(120,160,131,0.5)]" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge
                          variant={course.is_highlighted ? "secondary" : "outline"}
                          className={`text-xs font-semibold px-3 py-1.5 ${
                            course.is_highlighted
                              ? `bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800
                                 border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow
                                 dark:bg-gradient-to-r dark:from-[#50727B]/60 dark:to-[#344955]/80
                                 dark:text-[#78A083] dark:border-[#50727B]/40
                                 dark:shadow-[0_2px_8px_-2px_rgba(80,114,123,0.4)]
                                 dark:hover:shadow-[0_4px_12px_-2px_rgba(80,114,123,0.5)]`
                              : ''
                          }`}
                        >
                          {course.course_code}
                        </Badge>
                        <span className={`text-sm font-medium ${
                          course.is_highlighted
                            ? 'text-slate-700 dark:text-slate-300'
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
