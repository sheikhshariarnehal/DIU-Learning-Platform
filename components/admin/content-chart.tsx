"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Play, Users, Plus } from "lucide-react"
import { CreateCourseDialog } from "@/components/admin/create-course-dialog"
import { CreateTopicFromListDialog } from "@/components/admin/create-topic-from-list-dialog"
import { CreateContentDialog } from "@/components/admin/create-content-dialog"
import { CreateStudyToolFromListDialog } from "@/components/admin/create-study-tool-from-list-dialog"

interface ContentStats {
  courses: number
  topics: number
  slides: number
  videos: number
  studyTools: number
}

export function ContentChart() {
  const router = useRouter()
  const [stats, setStats] = useState<ContentStats>({
    courses: 0,
    topics: 0,
    slides: 0,
    videos: 0,
    studyTools: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogType, setCreateDialogType] = useState<"slide" | "video">("slide")
  const [navigating, setNavigating] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: coursesCount },
          { count: topicsCount },
          { count: slidesCount },
          { count: videosCount },
          { count: studyToolsCount },
        ] = await Promise.all([
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("topics").select("*", { count: "exact", head: true }),
          supabase.from("slides").select("*", { count: "exact", head: true }),
          supabase.from("videos").select("*", { count: "exact", head: true }),
          supabase.from("study_tools").select("*", { count: "exact", head: true }),
        ])

        setStats({
          courses: coursesCount || 0,
          topics: topicsCount || 0,
          slides: slidesCount || 0,
          videos: videosCount || 0,
          studyTools: studyToolsCount || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats()
  }

  const handleCreateContent = () => {
    setCreateDialogOpen(false)
    handleRefresh()
  }

  const handleQuickAction = (type: string) => {
    switch (type) {
      case "courses":
        setNavigating("courses")
        router.push("/admin/courses")
        break
      case "topics":
        setNavigating("topics")
        router.push("/admin/topics")
        break
      case "slides":
        setCreateDialogType("slide")
        setCreateDialogOpen(true)
        break
      case "videos":
        setCreateDialogType("video")
        setCreateDialogOpen(true)
        break
      case "studyTools":
        setNavigating("studyTools")
        router.push("/admin/study-tools")
        break
    }
  }

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>
  }

  const contentTypes = [
    {
      name: "Courses",
      count: stats.courses,
      icon: BookOpen,
      color: "bg-blue-500",
      key: "courses",
      action: "View All Courses"
    },
    {
      name: "Topics",
      count: stats.topics,
      icon: FileText,
      color: "bg-green-500",
      key: "topics",
      action: "View All Topics"
    },
    {
      name: "Slides",
      count: stats.slides,
      icon: FileText,
      color: "bg-purple-500",
      key: "slides",
      action: "Create New Slide"
    },
    {
      name: "Videos",
      count: stats.videos,
      icon: Play,
      color: "bg-red-500",
      key: "videos",
      action: "Create New Video"
    },
    {
      name: "Study Tools",
      count: stats.studyTools,
      icon: Users,
      color: "bg-orange-500",
      key: "studyTools",
      action: "View All Study Tools"
    },
  ]

  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {contentTypes.map((type) => (
          <Card
            key={type.name}
            className={`text-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group ${
              navigating === type.key ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleQuickAction(type.key)}
          >
            <CardContent className="p-4 relative">
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`}>
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{type.count}</div>
              <div className="text-sm text-muted-foreground">{type.name}</div>

              {/* Quick Action Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1 shadow-lg border border-gray-200">
                  {(type.key === "slides" || type.key === "videos") ? (
                    <Plus className="h-3 w-3" />
                  ) : (
                    <type.icon className="h-3 w-3" />
                  )}
                  {type.action}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Content Distribution</h4>
        {contentTypes.map((type) => {
          const percentage = total > 0 ? (type.count / total) * 100 : 0
          return (
            <div key={type.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 ${type.color} rounded-full`} />
                <span className="text-sm">{type.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 ${type.color} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <Badge variant="outline" className="text-xs min-w-[3rem]">
                  {type.count}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Content Dialog */}
      <CreateContentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        type={createDialogType}
        onSuccess={handleCreateContent}
      />
    </div>
  )
}
