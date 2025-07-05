"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Play, Users } from "lucide-react"

interface ContentStats {
  courses: number
  topics: number
  slides: number
  videos: number
  studyTools: number
}

export function ContentChart() {
  const [stats, setStats] = useState<ContentStats>({
    courses: 0,
    topics: 0,
    slides: 0,
    videos: 0,
    studyTools: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>
  }

  const contentTypes = [
    { name: "Courses", count: stats.courses, icon: BookOpen, color: "bg-blue-500" },
    { name: "Topics", count: stats.topics, icon: FileText, color: "bg-green-500" },
    { name: "Slides", count: stats.slides, icon: FileText, color: "bg-purple-500" },
    { name: "Videos", count: stats.videos, icon: Play, color: "bg-red-500" },
    { name: "Study Tools", count: stats.studyTools, icon: Users, color: "bg-orange-500" },
  ]

  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {contentTypes.map((type) => (
          <Card key={type.name} className="text-center">
            <CardContent className="p-4">
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{type.count}</div>
              <div className="text-sm text-muted-foreground">{type.name}</div>
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
    </div>
  )
}
