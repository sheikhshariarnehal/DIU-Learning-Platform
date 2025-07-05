import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, FileText, BookOpen, Users, ExternalLink } from "lucide-react"

interface CourseStudyToolsProps {
  courseId: string
}

export async function CourseStudyTools({ courseId }: CourseStudyToolsProps) {
  const { data: studyTools, error } = await supabase
    .from("study_tools")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false })

  if (error) {
    return <div className="text-red-500 text-sm">Error loading study tools: {error.message}</div>
  }

  if (!studyTools || studyTools.length === 0) {
    return (
      <div className="text-center py-6">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No study tools yet. Add exam materials and resources.</p>
      </div>
    )
  }

  const getStudyToolIcon = (type: string) => {
    switch (type) {
      case "previous_questions":
        return <FileText className="h-4 w-4" />
      case "exam_note":
        return <BookOpen className="h-4 w-4" />
      case "syllabus":
        return <FileText className="h-4 w-4" />
      case "mark_distribution":
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStudyToolLabel = (type: string) => {
    switch (type) {
      case "previous_questions":
        return "Previous Questions"
      case "exam_note":
        return "Exam Notes"
      case "syllabus":
        return "Syllabus"
      case "mark_distribution":
        return "Mark Distribution"
      default:
        return type
    }
  }

  const getExamTypeBadge = (examType: string) => {
    switch (examType) {
      case "midterm":
        return (
          <Badge variant="outline" className="text-xs">
            Midterm
          </Badge>
        )
      case "final":
        return (
          <Badge variant="outline" className="text-xs">
            Final
          </Badge>
        )
      case "both":
        return (
          <Badge variant="secondary" className="text-xs">
            Both
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      {studyTools.map((tool) => (
        <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-muted-foreground">{getStudyToolIcon(tool.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{tool.title}</h4>
                {getExamTypeBadge(tool.exam_type)}
              </div>
              <p className="text-xs text-muted-foreground">{getStudyToolLabel(tool.type)}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {tool.content_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={tool.content_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
