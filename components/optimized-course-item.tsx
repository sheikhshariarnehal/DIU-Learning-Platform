"use client"

import { memo, useState, useCallback } from "react"
import { ChevronDown, ChevronRight, FileText, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Smart text truncation utility for professional display
const smartTruncate = (text: string, maxLength: number = 45): string => {
  if (text.length <= maxLength) return text

  // Try to find a good breaking point (space, dash, colon, period)
  const breakPoints = [' ', '-', ':', '.', ',']
  let bestBreak = -1

  // Look for break points in the latter half of the allowed length
  for (let i = Math.floor(maxLength * 0.6); i < maxLength; i++) {
    if (breakPoints.includes(text[i])) {
      bestBreak = i
    }
  }

  // If we found a good break point, use it
  if (bestBreak > 0) {
    return text.substring(0, bestBreak) + '...'
  }

  // Otherwise, truncate at maxLength and add ellipsis
  return text.substring(0, maxLength - 3) + '...'
}

// Professional topic title formatter
const formatTopicTitle = (index: number, title: string, maxLength: number = 38): string => {
  const prefix = `${index + 1}. `
  const availableLength = maxLength - prefix.length

  if (title.length <= availableLength) {
    return `${prefix}${title}`
  }

  return `${prefix}${smartTruncate(title, availableLength)}`
}
import type { Database } from "@/lib/supabase"

type Course = Database["public"]["Tables"]["courses"]["Row"]
type Topic = Database["public"]["Tables"]["topics"]["Row"]
type Slide = Database["public"]["Tables"]["slides"]["Row"]
type Video = Database["public"]["Tables"]["videos"]["Row"]
type StudyTool = Database["public"]["Tables"]["study_tools"]["Row"]

interface OptimizedCourseItemProps {
  course: Course
  onContentSelect: (content: any) => void
  selectedContentId?: string
}

export const OptimizedCourseItem = memo(({ course, onContentSelect, selectedContentId }: OptimizedCourseItemProps) => {
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
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 hover:bg-slate-750 transition-all duration-200 border border-slate-700/50 shadow-lg">
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-0 h-auto hover:bg-transparent touch-manipulation"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3 w-full">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400 transition-transform duration-200" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm sm:text-base text-white truncate mb-1">
                {course.title}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="text-xs sm:text-sm text-slate-400 font-medium">
                  {course.course_code}
                </div>
                <div className="text-xs text-slate-500">
                  {course.teacher_name}
                </div>
              </div>

              {courseData && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs bg-slate-700/80 text-slate-300 border border-slate-600">
                    {courseData.length} Topics
                  </Badge>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-400">Loading content...</span>
                </div>
              )}
            </div>
          </div>
        </Button>
      </div>

      {/* Course Content */}
      {isExpanded && courseData && (
        <div className="ml-2 sm:ml-4 space-y-2 animate-fade-in">
          {courseData.map((topic: any, index: number) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              courseTitle={course.title}
              onContentSelect={onContentSelect}
              selectedContentId={selectedContentId}
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
    selectedContentId,
  }: {
    topic: any
    index: number
    courseTitle: string
    onContentSelect: (content: any) => void
    selectedContentId?: string
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <div className="bg-slate-900/50 rounded-lg border border-slate-700/30">
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-3 sm:p-4 h-auto hover:bg-slate-800/50 rounded-lg touch-manipulation"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 w-full">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-200" />
            )}
            <div className="flex-1 min-w-0">
              <span
                className="text-sm sm:text-base font-medium text-slate-300 topic-title-professional block"
                title={`${index + 1}. ${topic.title}`}
              >
                {formatTopicTitle(index, topic.title, 35)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {topic.videos?.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-red-900/30 text-red-300 border-red-800/50">
                    {topic.videos.length} Videos
                  </Badge>
                )}
                {topic.slides?.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-900/30 text-blue-300 border-blue-800/50">
                    {topic.slides.length} Slides
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Button>

        {isExpanded && (
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-1 animate-fade-in">
            {/* Videos */}
            {topic.videos?.map((video: Video, videoIndex: number) => {
              const isSelected = selectedContentId === video.id
              return (
                <Button
                  key={video.id}
                  variant="ghost"
                  className={`w-full justify-start text-left p-2 sm:p-3 h-auto rounded-md group touch-manipulation transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/20 border border-primary/30 shadow-md"
                      : "hover:bg-slate-800/70"
                  }`}
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
                  <div className="flex items-center gap-3 w-full">
                    <Play className={`h-4 w-4 flex-shrink-0 ${
                      isSelected ? "text-red-300" : "text-red-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm truncate block ${
                        isSelected
                          ? "text-white font-medium"
                          : "text-slate-300 group-hover:text-white"
                      }`}>
                        {videoIndex + 1}. {video.title}
                      </span>
                      <span className={`text-xs ${
                        isSelected
                          ? "text-slate-300"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}>
                        Video
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </Button>
              )
            })}

            {/* Slides */}
            {topic.slides?.map((slide: Slide, slideIndex: number) => {
              const isSelected = selectedContentId === slide.id
              return (
                <Button
                  key={slide.id}
                  variant="ghost"
                  className={`w-full justify-start text-left p-2 sm:p-3 h-auto rounded-md group touch-manipulation transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/20 border border-primary/30 shadow-md"
                      : "hover:bg-slate-800/70"
                  }`}
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
                  <div className="flex items-center gap-3 w-full">
                    <FileText className={`h-4 w-4 flex-shrink-0 ${
                      isSelected ? "text-blue-300" : "text-blue-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs sm:text-sm truncate block ${
                        isSelected
                          ? "text-white font-medium"
                          : "text-slate-300 group-hover:text-white"
                      }`}>
                        {(topic.videos?.length || 0) + slideIndex + 1}. {slide.title}
                      </span>
                      <span className={`text-xs ${
                        isSelected
                          ? "text-slate-300"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}>
                        Slide
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    )
  },
)

TopicItem.displayName = "TopicItem"
