import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, FileText, Play } from "lucide-react"

export async function DashboardStats() {
  const [
    { count: semesterCount },
    { count: courseCount },
    { count: topicCount },
    { count: slideCount },
    { count: videoCount },
    { count: studyToolCount },
  ] = await Promise.all([
    supabase.from("semesters").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("topics").select("*", { count: "exact", head: true }),
    supabase.from("slides").select("*", { count: "exact", head: true }),
    supabase.from("videos").select("*", { count: "exact", head: true }),
    supabase.from("study_tools").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    {
      title: "Total Semesters",
      value: semesterCount || 0,
      icon: Calendar,
      description: "Active semesters",
    },
    {
      title: "Total Courses",
      value: courseCount || 0,
      icon: BookOpen,
      description: "Courses available",
    },
    {
      title: "Topics",
      value: topicCount || 0,
      icon: FileText,
      description: "Learning topics",
    },
    {
      title: "Content Items",
      value: (slideCount || 0) + (videoCount || 0) + (studyToolCount || 0),
      icon: Play,
      description: "Slides, videos & tools",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
