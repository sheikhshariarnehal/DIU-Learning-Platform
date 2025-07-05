"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Video, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Item = {
  id: string
  title: string
  url: string
  order_index: number
  topic: { title: string; course: { title: string; semester: { name: string } } }
}

interface Props {
  content: Item[]
  type: "slide" | "video"
  loading: boolean
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

export function ContentList({ content, type, loading, onEdit, onDelete }: Props) {
  if (loading) return <p>Loading …</p>
  if (!content.length) return <p className="text-muted-foreground">No content found.</p>

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {content.map((c) => (
        <Card key={c.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-lg font-semibold">{c.title}</h3>
            <Badge variant="secondary" className="gap-1">
              {type === "slide" ? <FileText className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              {type === "slide" ? "Slide" : "Video"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              {c.topic.course.semester.name} &raquo; {c.topic.course.title} &raquo; {c.topic.title}
            </p>
            <p className="text-xs break-all">{c.url}</p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.open(c.url, "_blank")}>
                View
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onEdit(c)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
