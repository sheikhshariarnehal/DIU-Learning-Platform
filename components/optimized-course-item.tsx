"use client"

import { memo, useState, useCallback } from "react"
import { ChevronDown, ChevronRight, FileText, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/components/ui/use-mobile"

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
      <div className={`
        rounded-xl border transition-all duration-500 ease-out relative overflow-hidden
        ${course.is_highlighted
          ? `bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30
             border border-blue-200/60 border-l-4 border-l-blue-500
             shadow-[0_4px_12px_-2px_rgba(59,130,246,0.2),0_8px_24px_-4px_rgba(59,130,246,0.1)]
             hover:shadow-[0_12px_32px_-4px_rgba(59,130,246,0.3),0_8px_24px_-8px_rgba(59,130,246,0.15)]
             hover:border-blue-300/70 hover:-translate-y-1
             dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-blue-950/50 dark:to-indigo-950/40
             dark:border-blue-400/60 dark:border-l-blue-400
             dark:shadow-[0_6px_16px_-4px_rgba(59,130,246,0.4),0_12px_32px_-8px_rgba(0,0,0,0.5)]
             dark:hover:shadow-[0_16px_40px_-8px_rgba(59,130,246,0.5),0_20px_48px_-12px_rgba(0,0,0,0.6)]
             dark:hover:border-blue-400/80 dark:hover:glow-primary-soft`
          : `bg-slate-800/90 backdrop-blur-sm border-slate-700/50
             shadow-lg hover:shadow-xl hover:bg-slate-750
             dark:bg-slate-900/95 dark:border-slate-600/50
             dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)]
             dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]`
        }
      `}>
        <div className="p-3 sm:p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-0 h-auto hover:bg-transparent touch-manipulation"
            onClick={handleToggle}
          >
            <div className="flex items-center gap-3 w-full">
              {isExpanded ? (
                <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform duration-200 ${
                  course.is_highlighted ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                }`} />
              ) : (
                <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform duration-200 ${
                  course.is_highlighted ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                }`} />
              )}

              <div className="flex-1 min-w-0">
                {/* Course Title */}
                <div className={`font-bold text-sm sm:text-lg truncate mb-2 tracking-tight ${
                  course.is_highlighted
                    ? 'text-slate-800 dark:text-slate-100'
                    : 'text-white dark:text-slate-200'
                }`}>
                  {course.title}
                  {course.is_highlighted && (
                    <Star className="inline-block ml-2 h-4 w-4 text-amber-500 fill-amber-500 drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]" />
                  )}
                </div>

                {/* Course Code and Instructor */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <Badge
                    variant={course.is_highlighted ? "secondary" : "outline"}
                    className={`text-xs font-semibold w-fit px-3 py-1.5 ${
                      course.is_highlighted
                        ? `bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800
                           border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow
                           dark:bg-gradient-to-r dark:from-blue-900/60 dark:to-blue-800/40
                           dark:text-blue-200 dark:border-blue-600/40
                           dark:shadow-[0_2px_8px_-2px_rgba(59,130,246,0.3)]
                           dark:hover:shadow-[0_4px_12px_-2px_rgba(59,130,246,0.4)]`
                        : `bg-slate-700/80 text-slate-300 border-slate-600
                           dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-500`
                    }`}
                  >
                    {course.course_code}
                  </Badge>
                  <div className={`text-sm font-medium ${
                    course.is_highlighted
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {course.teacher_name}
                  </div>
                </div>

                {/* Course Stats */}
                {courseData && (
                  <div className={`flex flex-wrap gap-3 mt-3 ${
                    course.is_highlighted
                      ? `p-3 rounded-lg bg-gradient-to-r from-slate-50/60 to-blue-50/40 border border-slate-200/40
                         dark:bg-gradient-to-r dark:from-slate-800/60 dark:to-blue-900/30
                         dark:border-slate-700/40 dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]`
                      : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        course.is_highlighted
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm dark:shadow-blue-500/30'
                          : 'bg-slate-600 dark:bg-slate-700'
                      }`}>
                        <BookOpen className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <span className={`text-sm font-bold leading-none ${
                          course.is_highlighted
                            ? 'text-blue-800 dark:text-blue-200'
                            : 'text-slate-300 dark:text-slate-400'
                        }`}>
                          {courseData.length}
                        </span>
                        <p className={`text-xs font-medium ${
                          course.is_highlighted
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          Topics
                        </p>
                      </div>
                    </div>
                    {/* Calculate total slides */}
                    {(() => {
                      const totalSlides = courseData.reduce((total: number, topic: any) =>
                        total + (topic.slides?.length || 0), 0
                      );
                      return totalSlides > 0 && (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            course.is_highlighted
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm dark:shadow-emerald-500/30'
                              : 'bg-slate-600 dark:bg-slate-700'
                          }`}>
                            <Calendar className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <span className={`text-sm font-bold leading-none ${
                              course.is_highlighted
                                ? 'text-emerald-800 dark:text-emerald-200'
                                : 'text-slate-300 dark:text-slate-400'
                            }`}>
                              {totalSlides}
                            </span>
                            <p className={`text-xs font-medium ${
                              course.is_highlighted
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              Slides
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className={`h-3 w-3 sm:h-4 sm:w-4 animate-spin ${
                      course.is_highlighted
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400'
                    }`} />
                    <span className={`text-xs sm:text-sm ${
                      course.is_highlighted
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-slate-400'
                    }`}>
                      Loading content...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Button>
        </div>
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
    const isMobile = useIsMobile()

    return (
      <div className="bg-slate-900/50 rounded-lg border border-slate-700/30">
        <Button
          variant="ghost"
          className={`
            w-full justify-start text-left h-auto hover:bg-slate-800/50 rounded-lg touch-manipulation
            ${isMobile ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}
          `}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            {isExpanded ? (
              <ChevronDown className={`
                text-slate-400 transition-transform duration-200
                ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}
              `} />
            ) : (
              <ChevronRight className={`
                text-slate-400 transition-transform duration-200
                ${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}
              `} />
            )}
            <div className="flex-1 min-w-0">
              <span
                className={`
                  font-medium text-slate-300 topic-title-professional block
                  ${isMobile ? 'text-sm' : 'text-sm sm:text-base'}
                `}
                title={`${index + 1}. ${topic.title}`}
              >
                {formatTopicTitle(index, topic.title, isMobile ? 35 : 50)}
              </span>
            </div>
          </div>
        </Button>

        {isExpanded && (
          <div className={`
            space-y-1 animate-fade-in
            ${isMobile ? 'px-2 pb-2 sm:px-3 sm:pb-3' : 'px-3 pb-3 sm:px-4 sm:pb-4'}
          `}>
            {/* Videos */}
            {topic.videos?.map((video: Video, videoIndex: number) => {
              const isSelected = selectedContentId === video.id
              return (
                <Button
                  key={video.id}
                  variant="ghost"
                  className={`
                    w-full justify-start text-left h-auto rounded group touch-manipulation transition-colors
                    ${isMobile ? 'p-1.5 min-h-[40px]' : 'p-2'}
                    ${isSelected
                      ? "bg-primary/20 text-white"
                      : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                    }
                  `}
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
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Play className={`
                      flex-shrink-0
                      ${isMobile ? 'h-3 w-3' : 'h-3 w-3'}
                      ${isSelected ? "text-red-300" : "text-red-400"}
                    `} />
                    <span className={`
                      truncate
                      ${isMobile ? 'text-xs' : 'text-sm'}
                      ${isSelected ? "font-medium" : ""}
                    `}>
                      {video.title}
                    </span>
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
                  className={`
                    w-full justify-start text-left h-auto rounded group touch-manipulation transition-colors
                    ${isMobile ? 'p-1.5 min-h-[40px]' : 'p-2'}
                    ${isSelected
                      ? "bg-primary/20 text-white"
                      : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                    }
                  `}
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
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <FileText className={`
                      flex-shrink-0
                      ${isMobile ? 'h-3 w-3' : 'h-3 w-3'}
                      ${isSelected ? "text-blue-300" : "text-blue-400"}
                    `} />
                    <span className={`
                      truncate
                      ${isMobile ? 'text-xs' : 'text-sm'}
                      ${isSelected ? "font-medium" : ""}
                    `}>
                      {slide.title}
                    </span>
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
