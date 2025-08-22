import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, FileText, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateTopicFromListDialog } from "@/components/admin/create-topic-from-list-dialog"
import Link from "next/link"

export async function TopicsList() {
  const { data: topics, error } = await supabase
    .from("topics")
    .select(`
      *,
      courses(title, course_code),
      slides(count),
      videos(count)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading topics: {error.message}</div>
  }

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
        <p className="text-muted-foreground mb-6">Get started by creating your first topic for a course.</p>
        <CreateTopicFromListDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create First Topic
          </Button>
        </CreateTopicFromListDialog>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Topic</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((topic) => (
          <TableRow key={topic.id}>
            <TableCell className="font-medium">
              <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <span className="block truncate" title={topic.title}>
                  {topic.title}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {topic.courses ? (
                <div>
                  <div className="font-medium">{topic.courses.title}</div>
                  <Badge variant="outline" className="text-xs">
                    {topic.courses.course_code}
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">No course</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">#{topic.order_index}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(topic.slides) ? topic.slides.length : 0} slides
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(topic.videos) ? topic.videos.length : 0} videos
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(topic.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/topics/${topic.id}`}>
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
