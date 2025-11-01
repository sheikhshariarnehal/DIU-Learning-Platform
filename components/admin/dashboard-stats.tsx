"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { BookOpen, Calendar, FileText, Play, AlertCircle } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    semesterCount: 0,
    courseCount: 0,
    topicCount: 0,
    slideCount: 0,
    videoCount: 0,
    studyToolCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setError(null)
        
        // Add timeout to prevent indefinite loading
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        const statsPromise = Promise.all([
          supabase.from("semesters").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("topics").select("*", { count: "exact", head: true }),
          supabase.from("slides").select("*", { count: "exact", head: true }),
          supabase.from("videos").select("*", { count: "exact", head: true }),
          supabase.from("study_tools").select("*", { count: "exact", head: true }),
        ])

        const [
          { count: semesterCount, error: semesterError },
          { count: courseCount, error: courseError },
          { count: topicCount, error: topicError },
          { count: slideCount, error: slideError },
          { count: videoCount, error: videoError },
          { count: studyToolCount, error: studyToolError },
        ] = await Promise.race([statsPromise, timeout]) as any[]

        // Check for errors
        const errors = [semesterError, courseError, topicError, slideError, videoError, studyToolError].filter(Boolean)
        if (errors.length > 0) {
          throw new Error(errors[0].message)
        }

        setStats({
          semesterCount: semesterCount || 0,
          courseCount: courseCount || 0,
          topicCount: topicCount || 0,
          slideCount: slideCount || 0,
          videoCount: videoCount || 0,
          studyToolCount: studyToolCount || 0,
        })
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error)
        setError(error?.message || "Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsData = [
    {
      title: "Total Semesters",
      value: stats.semesterCount,
      icon: Calendar,
      description: "Active semesters",
    },
    {
      title: "Total Courses",
      value: stats.courseCount,
      icon: BookOpen,
      description: "Courses available",
    },
    {
      title: "Topics",
      value: stats.topicCount,
      icon: FileText,
      description: "Learning topics",
    },
    {
      title: "Content Items",
      value: stats.slideCount + stats.videoCount + stats.studyToolCount,
      icon: Play,
      description: "Slides, videos & tools",
    },
  ]

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}. Please check your database connection and try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
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
