import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export async function SemestersList() {
  const { data: semesters, error } = await supabase
    .from("semesters")
    .select(`
      *,
      courses(count)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading semesters: {error.message}</div>
  }

  if (!semesters || semesters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No semesters found. Create your first semester to get started.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead>Exams</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {semesters.map((semester) => (
          <TableRow key={semester.id}>
            <TableCell className="font-medium">{semester.title}</TableCell>
            <TableCell>{semester.section && <Badge variant="outline">{semester.section}</Badge>}</TableCell>
            <TableCell className="max-w-xs truncate">{semester.description || "No description"}</TableCell>
            <TableCell>
              <Badge variant="secondary">{Array.isArray(semester.courses) ? semester.courses.length : 0} courses</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {semester.has_midterm && (
                  <Badge variant="outline" className="text-xs">
                    Midterm
                  </Badge>
                )}
                {semester.has_final && (
                  <Badge variant="outline" className="text-xs">
                    Final
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(semester.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
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
