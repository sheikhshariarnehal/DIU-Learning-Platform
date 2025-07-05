import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, FileText, Play } from "lucide-react"

export async function RecentActivity() {
  // Get recent items from different tables
  const [{ data: recentSemesters }, { data: recentCourses }, { data: recentTopics }, { data: recentSlides }] =
    await Promise.all([
      supabase.from("semesters").select("*").order("created_at", { ascending: false }).limit(2),
      supabase.from("courses").select("*").order("created_at", { ascending: false }).limit(2),
      supabase.from("topics").select("*").order("created_at", { ascending: false }).limit(2),
      supabase.from("slides").select("*").order("created_at", { ascending: false }).limit(2),
    ])

  const activities = [
    ...(recentSemesters || []).map((item) => ({
      id: item.id,
      type: "semester",
      title: `New semester "${item.title}" created`,
      time: item.created_at,
      icon: Calendar,
    })),
    ...(recentCourses || []).map((item) => ({
      id: item.id,
      type: "course",
      title: `New course "${item.title}" added`,
      time: item.created_at,
      icon: BookOpen,
    })),
    ...(recentTopics || []).map((item) => ({
      id: item.id,
      type: "topic",
      title: `New topic "${item.title}" created`,
      time: item.created_at,
      icon: FileText,
    })),
    ...(recentSlides || []).map((item) => ({
      id: item.id,
      type: "slide",
      title: `New slide "${item.title}" uploaded`,
      time: item.created_at,
      icon: Play,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5)

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "semester":
        return "bg-blue-100 text-blue-800"
      case "course":
        return "bg-green-100 text-green-800"
      case "topic":
        return "bg-purple-100 text-purple-800"
      case "slide":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={getActivityColor(activity.type)}>
              <activity.icon className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(activity.time).toLocaleDateString()} at{" "}
              {new Date(activity.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {activity.type}
          </Badge>
        </div>
      ))}
    </div>
  )
}
