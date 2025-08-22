"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronRight, FileText, Play, BookOpen, Users, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { ProfessionalTopicTitle } from "@/components/ui/professional-topic-title"
import { useIsMobile } from "@/components/ui/use-mobile"
import React from "react"

type Semester = Database["public"]["Tables"]["semesters"]["Row"]
type Course = Database["public"]["Tables"]["courses"]["Row"]
type Topic = Database["public"]["Tables"]["topics"]["Row"]
type Slide = Database["public"]["Tables"]["slides"]["Row"]
type Video = Database["public"]["Tables"]["videos"]["Row"]
type StudyTool = Database["public"]["Tables"]["study_tools"]["Row"]

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
const formatTopicTitle = (index: number, title: string, maxLength: number = 42): string => {
  const prefix = `${index + 1}. `
  const availableLength = maxLength - prefix.length

  if (title.length <= availableLength) {
    return `${prefix}${title}`
  }

  return `${prefix}${smartTruncate(title, availableLength)}`
}

interface ContentItem {
  type: "slide" | "video" | "document"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
}

interface FunctionalSidebarProps {
  onContentSelect: (content: ContentItem) => void
  selectedContentId?: string
}

// Cache for storing fetched data
const dataCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to get cached data or fetch new data
const getCachedData = async (key: string, fetchFn: () => Promise<any>): Promise<any> => {
  const cached = dataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const data = await fetchFn()
  dataCache.set(key, { data, timestamp: Date.now() })
  return data
}

export function FunctionalSidebar({ onContentSelect, selectedContentId }: FunctionalSidebarProps) {
  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Expansion states
  const [expandedCourses, setExpandedCourses] = useState(new Set())
  const [expandedStudyTools, setExpandedStudyTools] = useState(new Set())
  const [expandedTopics, setExpandedTopics] = useState(new Set())
  const [expandedTopicItems, setExpandedTopicItems] = useState(new Set())

  // Course data cache with loading states
  const [courseData, setCourseData] = useState({})

  // Mobile-specific state and functionality
  const isMobile = useIsMobile()
  const [touchStartY, setTouchStartY] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [compactMode, setCompactMode] = useState(false)

  // Fetch semesters on component mount
  useEffect(() => {
    fetchSemesters()
  }, [])

  // Fetch courses when semester changes
  useEffect(() => {
    if (selectedSemester) {
      fetchCourses(selectedSemester)
    }
  }, [selectedSemester])

  const fetchSemesters = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getCachedData("semesters", async () => {
        const { data, error } = await supabase.from("semesters").select("*").order("created_at", { ascending: false })
        if (error) throw error
        return data || []
      })

      setSemesters(data)

      // Auto-select first semester
      if (data && data.length > 0) {
        setSelectedSemester(data[0].id)
      }
    } catch (err) {
      console.error("Error fetching semesters:", err)
      setError("Failed to load semesters")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourses = async (semesterId: string) => {
    try {
      setError(null)

      const data = await getCachedData(`courses-${semesterId}`, async () => {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("semester_id", semesterId)
          .order("created_at", { ascending: true })
        if (error) throw error
        return data || []
      })

      setCourses(data)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("Failed to load courses")
    }
  }

  const fetchCourseData = async (courseId: string) => {
    if (courseData[courseId] && !courseData[courseId].isLoading) return

    // Set loading state
    setCourseData((prev) => ({
      ...prev,
      [courseId]: {
        topics: [],
        studyTools: [],
        slides: {},
        videos: {},
        isLoading: true,
      },
    }))

    try {
      // Use optimized single query to fetch all course data
      const data = await getCachedData(`course-data-${courseId}`, async () => {
        // Fetch all data in parallel
        const [topicsResult, studyToolsResult] = await Promise.all([
          supabase
            .from("topics")
            .select(`
              *,
              slides(*),
              videos(*)
            `)
            .eq("course_id", courseId)
            .order("order_index", { ascending: true }),
          supabase.from("study_tools").select("*").eq("course_id", courseId),
        ])

        if (topicsResult.error) throw topicsResult.error
        if (studyToolsResult.error) throw studyToolsResult.error

        // Organize slides and videos by topic
        const slides = {}
        const videos = {}

        topicsResult.data?.forEach((topic) => {
          slides[topic.id] = (topic.slides || []).sort((a, b) => a.order_index - b.order_index)
          videos[topic.id] = (topic.videos || []).sort((a, b) => a.order_index - b.order_index)
        })

        return {
          topics: topicsResult.data || [],
          studyTools: studyToolsResult.data || [],
          slides,
          videos,
        }
      })

      setCourseData((prev) => ({
        ...prev,
        [courseId]: {
          ...data,
          isLoading: false,
        },
      }))
    } catch (err) {
      console.error("Error fetching course data:", err)
      setError("Failed to load course content")
      setCourseData((prev) => ({
        ...prev,
        [courseId]: {
          topics: [],
          studyTools: [],
          slides: {},
          videos: {},
          isLoading: false,
        },
      }))
    }
  }

  // Optimized toggle functions with debouncing
  const toggleCourse = useCallback((courseId: string) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
        // Only fetch data when expanding
        setTimeout(() => fetchCourseData(courseId), 0)
      }
      return newSet
    })
  }, [])

  const toggleStudyTools = useCallback((courseId: string) => {
    setExpandedStudyTools((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  const toggleTopics = useCallback((courseId: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }, [])

  const toggleTopicItem = useCallback((topicId: string) => {
    setExpandedTopicItems((prev) => {
      const newSet = new Set()
      // If the clicked topic is already expanded, close it (empty set)
      // If it's not expanded, open only this topic (set with only this topic)
      if (!prev.has(topicId)) {
        newSet.add(topicId)
      }
      return newSet
    })
  }, [])

  // Content selection handlers
  const handleContentClick = useCallback(
    (
      type: "slide" | "video" | "document",
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
    ) => {
      onContentSelect({
        type,
        title,
        url,
        id,
        topicTitle,
        courseTitle,
      })
    },
    [onContentSelect],
  )

  // Memoized utility functions
  const getStudyToolIcon = useCallback((type: string) => {
    switch (type) {
      case "previous_questions":
        return <FileText className="h-4 w-4 text-blue-400" />
      case "exam_note":
        return <BookOpen className="h-4 w-4 text-green-400" />
      case "syllabus":
        return <FileText className="h-4 w-4 text-purple-400" />
      case "mark_distribution":
        return <Users className="h-4 w-4 text-orange-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }, [])

  const getStudyToolLabel = useCallback((type: string) => {
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
        return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }, [])

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return courses
  }, [courses])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-border`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-foreground`}>
            Course Content
          </h3>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompactMode(!compactMode)}
              className="h-8 w-8 p-0"
            >
              {compactMode ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Semester Selection */}
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className={`bg-card border-border text-foreground ${isMobile ? 'h-10 text-sm' : 'h-11'}`}>
            <SelectValue placeholder={isMobile ? "Select Semester" : "Choose your semester"} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {semesters.map((semester) => (
              <SelectItem
                key={semester.id}
                value={semester.id}
                className={`text-foreground hover:bg-accent ${isMobile ? 'text-sm py-2' : ''}`}
              >
                {semester.title} {semester.section && `(${semester.section})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Course List */}
      <ScrollArea className="flex-1">
        <div
          className={`${isMobile ? 'p-2' : 'p-4'} space-y-${isMobile ? '2' : '3'}`}
          onTouchStart={(e) => {
            setTouchStartY(e.touches[0].clientY)
            setIsScrolling(false)
          }}
          onTouchMove={(e) => {
            if (touchStartY !== null) {
              const deltaY = Math.abs(e.touches[0].clientY - touchStartY)
              if (deltaY > 10) {
                setIsScrolling(true)
              }
            }
          }}
          onTouchEnd={() => {
            setTouchStartY(null)
            setTimeout(() => setIsScrolling(false), 100)
          }}
        >
          {filteredCourses.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8 sm:py-12'}`}>
              <BookOpen className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10 sm:h-12 sm:w-12'} text-muted-foreground mx-auto mb-4`} />
              <p className={`${isMobile ? 'text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>
                No courses available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">Check your semester selection</p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                courseData={courseData[course.id]}
                expandedCourses={expandedCourses}
                expandedStudyTools={expandedStudyTools}
                expandedTopics={expandedTopics}
                expandedTopicItems={expandedTopicItems}
                onToggleCourse={toggleCourse}
                onToggleStudyTools={toggleStudyTools}
                onToggleTopics={toggleTopics}
                onToggleTopicItem={toggleTopicItem}
                onContentClick={handleContentClick}
                getStudyToolIcon={getStudyToolIcon}
                getStudyToolLabel={getStudyToolLabel}
                selectedContentId={selectedContentId}
                isMobile={isMobile}
                compactMode={compactMode}
                isScrolling={isScrolling}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Memoized CourseItem component to prevent unnecessary re-renders
const CourseItem = React.memo(
  ({
    course,
    courseData,
    expandedCourses,
    expandedStudyTools,
    expandedTopics,
    expandedTopicItems,
    onToggleCourse,
    onToggleStudyTools,
    onToggleTopics,
    onToggleTopicItem,
    onContentClick,
    getStudyToolIcon,
    getStudyToolLabel,
    selectedContentId,
    isMobile = false,
    compactMode = false,
    isScrolling = false,
  }: {
    course: Course
    courseData?: any
    expandedCourses: Set<string>
    expandedStudyTools: Set<string>
    expandedTopics: Set<string>
    expandedTopicItems: Set<string>
    onToggleCourse: (id: string) => void
    onToggleStudyTools: (id: string) => void
    onToggleTopics: (id: string) => void
    onToggleTopicItem: (id: string) => void
    onContentClick: (
      type: any,
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
    ) => void
    getStudyToolIcon: (type: string) => React.ReactNode
    getStudyToolLabel: (type: string) => string
    selectedContentId?: string
    isMobile?: boolean
    compactMode?: boolean
    isScrolling?: boolean
  }) => {
    return (
      <div className={isMobile ? 'space-y-1' : 'space-y-2'}>
        {/* Course Header */}
        <div className={`bg-card rounded-lg ${isMobile ? 'p-2' : 'p-3'} hover:bg-accent/50 transition-colors border border-border touch-manipulation`}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-left p-0 h-auto hover:bg-transparent ${isMobile ? 'min-h-[44px]' : ''}`}
            onClick={() => !isScrolling && onToggleCourse(course.id)}
          >
            <div className="flex items-center gap-2 w-full">
              {expandedCourses.has(course.id) ? (
                <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} shrink-0 text-muted-foreground`} />
              ) : (
                <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} shrink-0 text-muted-foreground`} />
              )}
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'} text-foreground truncate`}>
                  {course.title}
                </div>
                {!compactMode && (
                  <>
                    <div className="text-xs text-muted-foreground">({course.course_code})</div>
                    <div className="text-xs text-muted-foreground">{course.teacher_name}</div>
                  </>
                )}

                {courseData && !courseData.isLoading && !compactMode && (
                  <div className={`flex gap-1 mt-2 ${isMobile ? 'flex-wrap' : ''}`}>
                    <Badge variant="secondary" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'} bg-secondary text-secondary-foreground`}>
                      {courseData.topics.length} Topics
                    </Badge>
                    {!isMobile && (
                      <>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          {Object.values(courseData.slides).flat().length} Slides
                        </Badge>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          {Object.values(courseData.videos).flat().length} Videos
                        </Badge>
                      </>
                    )}
                  </div>
                )}

                {courseData?.isLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading content...</span>
                  </div>
                )}
              </div>
            </div>
          </Button>
        </div>

        {/* Course Content */}
        {expandedCourses.has(course.id) && courseData && !courseData.isLoading && (
          <div className="ml-4 space-y-2">
            {/* Study Tools Section */}
            {courseData.studyTools.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left p-2 h-auto hover:bg-accent rounded-md"
                  onClick={() => onToggleStudyTools(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedStudyTools.has(course.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">Study Resources</span>
                    <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground ml-auto">
                      {courseData.studyTools.length}
                    </Badge>
                  </div>
                </Button>

                {expandedStudyTools.has(course.id) && (
                  <div className="ml-6 space-y-1">
                    {courseData.studyTools.map((tool: StudyTool) => {
                      const isSelected = selectedContentId === tool.id
                      return (
                        <Button
                          key={tool.id}
                          variant="ghost"
                          className={`w-full justify-start text-left p-2 h-auto rounded-md transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/10 border border-primary/20 shadow-sm"
                              : "hover:bg-accent"
                          }`}
                          onClick={() =>
                            tool.content_url &&
                            onContentClick("document", tool.title, tool.content_url, tool.id, undefined, course.title)
                          }
                          disabled={!tool.content_url}
                        >
                          <div className="flex items-center gap-2">
                            {getStudyToolIcon(tool.type)}
                            <span className={`text-xs ${
                              isSelected ? "text-foreground font-medium" : "text-foreground"
                            }`}>
                              {getStudyToolLabel(tool.type)}
                            </span>
                            {tool.exam_type !== "both" && (
                              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                {tool.exam_type}
                              </Badge>
                            )}
                            {isSelected && (
                              <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Topics Section */}
            {courseData.topics.length > 0 && (
              <div className="min-w-0">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${isMobile ? 'p-2 min-h-[44px]' : 'p-2'} h-auto hover:bg-accent rounded-md touch-manipulation`}
                  onClick={() => !isScrolling && onToggleTopics(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedTopics.has(course.id) ? (
                      <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
                    ) : (
                      <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
                    )}
                    <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
                    <span className={`${isMobile ? 'text-sm font-medium' : 'text-sm'} text-foreground`}>Topics</span>
                    <Badge variant="secondary" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'} bg-secondary text-secondary-foreground ml-auto`}>
                      {courseData.topics.length}
                    </Badge>
                  </div>
                </Button>

                {expandedTopics.has(course.id) && (
                  <div className="ml-6 space-y-1 min-w-0">
                    {courseData.topics.map((topic: Topic, index: number) => {
                      const topicSlides = courseData.slides[topic.id] || []
                      const topicVideos = courseData.videos[topic.id] || []

                      return (
                        <div key={topic.id}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left ${isMobile ? 'p-2 min-h-[44px]' : 'p-3'} h-auto min-w-0 sidebar-item-professional touch-manipulation ${
                              expandedTopicItems.has(topic.id)
                                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => !isScrolling && onToggleTopicItem(topic.id)}
                          >
                            <div className="flex items-center gap-2 w-full min-w-0">
                              {expandedTopicItems.has(topic.id) ? (
                                <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} text-muted-foreground flex-shrink-0`} />
                              ) : (
                                <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} text-muted-foreground flex-shrink-0`} />
                              )}
                              <div className="flex-1 min-w-0">
                                <ProfessionalTopicTitle
                                  index={index}
                                  title={topic.title}
                                  maxLength={isMobile ? 25 : 35}
                                  variant={isMobile ? "compact" : "default"}
                                  className={expandedTopicItems.has(topic.id) ? "text-primary font-semibold" : "text-foreground"}
                                />
                              </div>

                              {/* Content count badge */}
                              {!expandedTopicItems.has(topic.id) && (
                                <Badge
                                  variant="secondary"
                                  className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'} bg-secondary/80 text-secondary-foreground ml-2 flex-shrink-0`}
                                >
                                  {topicVideos.length + topicSlides.length}
                                </Badge>
                              )}
                            </div>
                          </Button>

                          {expandedTopicItems.has(topic.id) && (
                            <div className={`${isMobile ? 'ml-4' : 'ml-6'} space-y-1 topic-content-enter-active mt-2 p-2 bg-muted/30 rounded-lg border border-border/50`}>
                              {/* Content Header */}
                              <div className="flex items-center justify-between mb-2 pb-1 border-b border-border/30">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Topic Content
                                </span>
                                <div className="flex gap-1">
                                  {topicVideos.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                      {topicVideos.length} Videos
                                    </Badge>
                                  )}
                                  {topicSlides.length > 0 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                      {topicSlides.length} Slides
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Videos Section */}
                              {topicVideos.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Play className="h-3 w-3 text-red-400" />
                                    <span className="text-xs font-medium text-muted-foreground">Videos</span>
                                  </div>
                                  {topicVideos.map((video: Video, videoIndex: number) => {
                                const isSelected = selectedContentId === video.id
                                return (
                                  <Button
                                    key={video.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-left ${isMobile ? 'p-2 min-h-[40px]' : 'p-2'} h-auto rounded-md group transition-all duration-200 touch-manipulation ${
                                      isSelected
                                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                                        : "hover:bg-accent"
                                    }`}
                                    onClick={() =>
                                      !isScrolling && onContentClick(
                                        "video",
                                        video.title,
                                        video.youtube_url,
                                        video.id,
                                        topic.title,
                                        course.title,
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <Play className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} ${isSelected ? "text-red-500" : "text-red-400"}`} />
                                      <span className={`${isMobile ? 'text-sm' : 'text-xs'} truncate ${
                                        isSelected
                                          ? "text-foreground font-medium"
                                          : "text-muted-foreground group-hover:text-foreground"
                                      }`}>
                                        {videoIndex + 1}. {video.title}
                                      </span>
                                      {isSelected && (
                                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                                      )}
                                    </div>
                                  </Button>
                                )
                                  })}
                                </div>
                              )}

                              {/* Slides Section */}
                              {topicSlides.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-3 w-3 text-blue-400" />
                                    <span className="text-xs font-medium text-muted-foreground">Slides</span>
                                  </div>
                                  {topicSlides.map((slide: Slide, slideIndex: number) => {
                                const isSelected = selectedContentId === slide.id
                                return (
                                  <Button
                                    key={slide.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-left ${isMobile ? 'p-2 min-h-[40px]' : 'p-2'} h-auto rounded-md group transition-all duration-200 touch-manipulation ${
                                      isSelected
                                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                                        : "hover:bg-accent"
                                    }`}
                                    onClick={() =>
                                      !isScrolling && onContentClick(
                                        "slide",
                                        slide.title,
                                        slide.google_drive_url,
                                        slide.id,
                                        topic.title,
                                        course.title,
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} ${isSelected ? "text-blue-500" : "text-blue-400"}`} />
                                      <span className={`${isMobile ? 'text-sm' : 'text-xs'} truncate ${
                                        isSelected
                                          ? "text-foreground font-medium"
                                          : "text-muted-foreground group-hover:text-foreground"
                                      }`}>
                                        {topicVideos.length + slideIndex + 1}. {slide.title}
                                      </span>
                                      {isSelected && (
                                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                                      )}
                                    </div>
                                  </Button>
                                )
                                  })}
                                </div>
                              )}

                              {topicSlides.length === 0 && topicVideos.length === 0 && (
                                <div className="text-xs text-muted-foreground py-2 pl-2 text-center">
                                  No content available for this topic
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Empty state for course with no content */}
            {courseData.topics.length === 0 && courseData.studyTools.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">No content available for this course</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

CourseItem.displayName = "CourseItem"
