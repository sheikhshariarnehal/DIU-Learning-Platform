"use client"

import { memo, useState, useCallback } from "react"
import { ChevronDown, ChevronRight, FileText, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Topic = Database["public"]["Tables"]["topics"]["Row"]
type Slide = Database["public"]["Tables"]["slides"]["Row"]
type Video = Database["public"]["Tables"]["videos"]["Row"]
type StudyTool = Database["public"]["Tables"]["study_tools"]["Row"]

interface OptimizedCourseItemProps {
  course: Course
  onContentSelect: (content: any) => void
}

export const OptimizedCourseItem = memo(({ course, onContentSelect }: OptimizedCourseItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [courseData, setCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCourseData = useCallback(async () => {
    if (courseData || isLoading) return

    setIsLoading(true)
    try {
      // Fetch all course data in a single optimized request
      const response = await fetch(`/api/courses/${course.id}/topics`)
      const data = await response.json()
      setCourseData(data)
    } catch (error) {
      console.error("Failed to fetch course data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [course.id, courseData, isLoading])

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => {
      const newExpanded = !prev
      if (newExpanded && !courseData) {
        fetchCourseData()
      }
      return newExpanded
    })
  }, [courseData, fetchCourseData])

  return (
    <div className="space-y-1">
      {/* Course Header */}
      <div className="bg-slate-800 rounded-lg p-3 hover:bg-slate-750 transition-colors">
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-0 h-auto hover:bg-transparent"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2 w-full">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-white truncate">{course.title}</div>
              <div className="text-xs text-slate-400">({course.course_code})</div>
              <div className="text-xs text-slate-500">{course.teacher_name}</div>

              {courseData && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                    {courseData.length} Topics
                  </Badge>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </Button>
      </div>

      {/* Course Content */}
      {isExpanded && courseData && (
        <div className="ml-4 space-y-1">
          {courseData.map((topic: any, index: number) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              courseTitle={course.title}
              onContentSelect={onContentSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
})

OptimizedCourseItem.displayName = "OptimizedCourseItem"

// Memoized Topic Item component
const TopicItem = memo(
  ({
    topic,
    index,
    courseTitle,
    onContentSelect,
  }: {
    topic: any
    index: number
    courseTitle: string
    onContentSelect: (content: any) => void
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <div>
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-2 h-auto hover:bg-slate-800 rounded-md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 w-full">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400" />
            )}
            <span className="text-sm flex-1 text-slate-300 truncate">
              {index + 1}. {topic.title}
            </span>
          </div>
        </Button>

        {isExpanded && (
          <div className="ml-6 space-y-1">
            {/* Videos */}
            {topic.videos?.map((video: Video, videoIndex: number) => (
              <Button
                key={video.id}
                variant="ghost"
                className="w-full justify-start text-left p-2 h-auto hover:bg-slate-800 rounded-md group"
                onClick={() =>
                  onContentSelect({
                    type: "video",
                    title: video.title,
                    url: video.youtube_url,
                    id: video.id,
                    topicTitle: topic.title,
                    courseTitle,
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <Play className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-slate-300 group-hover:text-white truncate">
                    {videoIndex + 1}. {video.title}
                  </span>
                </div>
              </Button>
            ))}

            {/* Slides */}
            {topic.slides?.map((slide: Slide, slideIndex: number) => (
              <Button
                key={slide.id}
                variant="ghost"
                className="w-full justify-start text-left p-2 h-auto hover:bg-slate-800 rounded-md group"
                onClick={() =>
                  onContentSelect({
                    type: "slide",
                    title: slide.title,
                    url: slide.google_drive_url,
                    id: slide.id,
                    topicTitle: topic.title,
                    courseTitle,
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-slate-300 group-hover:text-white truncate">
                    {(topic.videos?.length || 0) + slideIndex + 1}. {slide.title}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  },
)

TopicItem.displayName = "TopicItem"
