"use client"

import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from "react"
import {
  ChevronDown, ChevronRight, FileText, Play, BookOpen, Loader2, AlertCircle,
  GraduationCap, ClipboardList, BarChart3, PenTool, FlaskConical, Library
} from "lucide-react"
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
  type: "slide" | "video" | "document" | "syllabus" | "study-tool"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
  description?: string
  courseCode?: string
  teacherName?: string
  semesterInfo?: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
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

      // Auto-select the first active semester, or fallback to the first semester
      if (data && data.length > 0) {
        const activeSemester = data.find(semester => semester.is_active === true)
        const semesterToSelect = activeSemester || data[0]
        setSelectedSemester(semesterToSelect.id)
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
          .order("is_highlighted", { ascending: false }) // Highlighted courses first
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

  const fetchCourseData = useCallback(async (courseId: string) => {
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
        // Fetch only topics first (most important data)
        const topicsResult = await supabase
          .from("topics")
          .select("id, title, order_index, course_id")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true })

        if (topicsResult.error) throw topicsResult.error

        // Fetch study tools in parallel (less priority)
        const studyToolsPromise = supabase
          .from("study_tools")
          .select("id, title, type, content_url, description, course_id")
          .eq("course_id", courseId)

        const studyToolsResult = await studyToolsPromise

        return {
          topics: topicsResult.data || [],
          studyTools: studyToolsResult.data || [],
          slides: {},
          videos: {},
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
  }, [courseData])

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

  // Lazy load topic content (slides and videos) only when expanded
  const fetchTopicContent = useCallback(async (courseId: string, topicId: string) => {
    const currentCourseData = courseData[courseId]
    if (!currentCourseData || currentCourseData.slides[topicId] || currentCourseData.videos[topicId]) return

    try {
      const cacheKey = `topic-content-${topicId}`
      const data = await getCachedData(cacheKey, async () => {
        const [slidesResult, videosResult] = await Promise.all([
          supabase
            .from("slides")
            .select("id, title, google_drive_url, order_index, topic_id")
            .eq("topic_id", topicId)
            .order("order_index", { ascending: true }),
          supabase
            .from("videos")
            .select("id, title, youtube_url, order_index, topic_id")
            .eq("topic_id", topicId)
            .order("order_index", { ascending: true }),
        ])

        return {
          slides: slidesResult.data || [],
          videos: videosResult.data || [],
        }
      })

      setCourseData((prev) => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          slides: {
            ...prev[courseId].slides,
            [topicId]: data.slides,
          },
          videos: {
            ...prev[courseId].videos,
            [topicId]: data.videos,
          },
        },
      }))
    } catch (err) {
      console.error("Error fetching topic content:", err)
    }
  }, [courseData])

  const toggleTopicItem = useCallback((topicId: string, courseId: string) => {
    setExpandedTopicItems((prev) => {
      const newSet = new Set()
      // If the clicked topic is already expanded, close it (empty set)
      // If it's not expanded, open only this topic (set with only this topic)
      if (!prev.has(topicId)) {
        newSet.add(topicId)
        // Lazy load content when expanding
        fetchTopicContent(courseId, topicId)
      }
      return newSet
    })
  }, [fetchTopicContent])

  // Content selection handlers
  const handleContentClick = useCallback(
    (
      type: "slide" | "video" | "document" | "syllabus" | "study-tool",
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
      description?: string,
    ) => {
      onContentSelect({
        type,
        title,
        url,
        id,
        topicTitle,
        courseTitle,
        description,
      })
    },
    [onContentSelect],
  )

  // Memoized utility functions
  const getStudyToolIcon = useCallback((type: string) => {
    switch (type) {
      case "previous_questions":
        return <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      case "exam_note":
      case "exam_notes":
        return <BookOpen className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      case "syllabus":
        return <GraduationCap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
      case "mark_distribution":
        return <BarChart3 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
      case "assignment":
        return <PenTool className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
      case "lab_manual":
        return <FlaskConical className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
      case "reference_book":
        return <Library className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      default:
        return <FileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
    }
  }, [])

  const getStudyToolLabel = useCallback((type: string) => {
    switch (type) {
      case "previous_questions":
        return "Previous Questions"
      case "exam_note":
      case "exam_notes":
        return "Exam Notes"
      case "syllabus":
        return "Syllabus"
      case "mark_distribution":
        return "Mark Distribution"
      case "assignment":
        return "Assignment"
      case "lab_manual":
        return "Lab Manual"
      case "reference_book":
        return "Reference Book"
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }, [])

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    return courses
  }, [courses])

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Skeleton Loader for better perceived performance */}
        <div className={`${isMobile ? 'px-4 py-3' : 'p-4'} border-b border-border/30`}>
          <div className="h-11 bg-muted/50 rounded-lg animate-pulse"></div>
        </div>
        <div className={`${isMobile ? 'px-4 py-3' : 'p-4'} space-y-3`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border/20 p-3 animate-pulse">
              <div className="h-4 bg-muted/50 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col bg-background ${isMobile ? 'mobile-scroll-container' : ''}`}>
      {/* Header - Simplified for Mobile */}
      <div className={`${isMobile ? 'px-4 py-3 bg-background border-b border-border/30' : 'p-4 border-b border-border'}`}>
        {/* Mobile: Simple header without title */}
        {isMobile ? (
          <div>
            {/* Simplified Semester Selection for Mobile */}
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="h-11 bg-card border-border/50 text-foreground rounded-lg shadow-sm">
                <SelectValue placeholder="Select Semester">
                  {selectedSemester && (() => {
                    const selectedSem = semesters.find(s => s.id === selectedSemester)
                    return selectedSem ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium truncate">
                          {selectedSem.title} {selectedSem.section && `(${selectedSem.section})`}
                        </span>
                        {(selectedSem.is_active ?? true) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    ) : null
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50 rounded-lg shadow-lg">
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.id}
                    value={semester.id}
                    className="text-foreground hover:bg-accent/50 py-3 px-4 rounded-md mx-1"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {semester.title}
                        </span>
                        {semester.section && (
                          <span className="text-xs text-muted-foreground">
                            Section: {semester.section}
                          </span>
                        )}
                      </div>
                      {(semester.is_active ?? true) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop Header */
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Course Content</h3>
            </div>

            {/* Desktop Semester Selection */}
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="bg-card border-border text-foreground h-11">
                <SelectValue placeholder="Choose your semester">
                  {selectedSemester && (() => {
                    const selectedSem = semesters.find(s => s.id === selectedSemester)
                    return selectedSem ? (
                      <div className="flex items-center gap-2">
                        <span>{selectedSem.title} {selectedSem.section && `(${selectedSem.section})`}</span>
                        {(selectedSem.is_active ?? true) && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    ) : null
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {semesters.map((semester) => (
                  <SelectItem
                    key={semester.id}
                    value={semester.id}
                    className="text-foreground hover:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {semester.title} {semester.section && `(${semester.section})`}
                      </span>
                      {(semester.is_active ?? true) && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
      <ScrollArea className={`flex-1 ${isMobile ? 'mobile-scroll-container' : ''}`}>
        <div
          className={`${isMobile ? 'px-4 py-3 space-y-2' : 'p-4 space-y-3'}`}
          onTouchStart={(e) => {
            if (isMobile) {
              setTouchStartY(e.touches[0].clientY)
              setIsScrolling(false)
            }
          }}
          onTouchMove={(e) => {
            if (isMobile && touchStartY !== null) {
              const deltaY = Math.abs(e.touches[0].clientY - touchStartY)
              if (deltaY > 10) {
                setIsScrolling(true)
              }
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              setTouchStartY(null)
              setTimeout(() => setIsScrolling(false), 100)
            }
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
    onToggleTopicItem: (topicId: string, courseId: string) => void
    onContentClick: (
      type: any,
      title: string,
      url: string,
      id: string,
      topicTitle?: string,
      courseTitle?: string,
      description?: string,
    ) => void
    getStudyToolIcon: (type: string) => React.ReactNode
    getStudyToolLabel: (type: string) => string
    selectedContentId?: string
    isMobile?: boolean
    compactMode?: boolean
    isScrolling?: boolean
  }) => {
    return (
      <div className={`${isMobile ? 'space-y-2' : 'space-y-2'}`}>
        {/* Course Header - Simple Mobile Design */}
        <div className={`${isMobile ? 'bg-card rounded-lg border border-border/20' : 'bg-card rounded-lg hover:bg-accent/50 transition-colors border border-border'}`}>
          <div className={`p-3 rounded-lg ${course.is_highlighted ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}`}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-left p-0 h-auto hover:bg-transparent ${isMobile ? 'min-h-[48px]' : ''}`}
            onClick={() => !isScrolling && onToggleCourse(course.id)}
          >
            <div className="flex items-start gap-3 w-full">
              {/* Chevron Icon */}
              <div className="flex-shrink-0 mt-1">
                {expandedCourses.has(course.id) ? (
                  <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
                ) : (
                  <ChevronRight className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-muted-foreground`} />
                )}
              </div>

              {/* Course Content */}
              <div className="flex-1 min-w-0">
                {isMobile ? (
                  /* Mobile Layout - Simple and Clean */
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground leading-tight flex-1">
                        {course.title}
                      </h4>
                      {course.is_highlighted && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        {course.course_code}
                      </span>
                      <span className="text-xs text-muted-foreground/60">•</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {course.teacher_name}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Desktop Layout */
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm text-foreground truncate flex-1">
                        {course.title}
                      </div>
                      {course.is_highlighted && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      )}
                    </div>
                    {!compactMode && (
                      <>
                        <div className="text-xs text-muted-foreground">({course.course_code})</div>
                        <div className="text-xs text-muted-foreground">{course.teacher_name}</div>
                      </>
                    )}

                    {courseData && !courseData.isLoading && !compactMode && (
                      <div className="flex gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                          {courseData.topics.length} Topics
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                          {Object.values(courseData.videos).flat().length > 0 && (
                            <span>{Object.values(courseData.videos).flat().length} Video{Object.values(courseData.videos).flat().length > 1 ? 's' : ''}</span>
                          )}
                          {Object.values(courseData.videos).flat().length > 0 && Object.values(courseData.slides).flat().length > 0 && (
                            <span className="text-muted-foreground/60">•</span>
                          )}
                          {Object.values(courseData.slides).flat().length > 0 && (
                            <span>{Object.values(courseData.slides).flat().length} Slide{Object.values(courseData.slides).flat().length > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
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
        </div>

        {/* Course Content */}
        {expandedCourses.has(course.id) && courseData && !courseData.isLoading && (
          <div className={`${isMobile ? 'ml-4 space-y-2' : 'ml-4 space-y-2'}`}>
            {/* Study Tools Section */}
            {courseData.studyTools.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${isMobile ? 'p-2 h-auto hover:bg-accent/30 rounded-md' : 'p-2 h-auto hover:bg-accent rounded-md'}`}
                  onClick={() => onToggleStudyTools(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedStudyTools.has(course.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground flex-1">
                      Study Resources
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {courseData.studyTools.length}
                    </span>
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
                          className={`w-full justify-start text-left px-2 py-1.5 h-auto rounded transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent/50"
                          }`}
                          onClick={() => {
                            if (tool.type === "syllabus") {
                              // For syllabus, use description as content and pass it via URL parameter
                              onContentClick("syllabus", tool.title, `#syllabus-${tool.id}`, tool.id, undefined, course.title, tool.description)
                            } else if (tool.content_url) {
                              onContentClick("study-tool", tool.title, tool.content_url, tool.id, undefined, course.title)
                            }
                          }}
                          disabled={tool.type !== "syllabus" && !tool.content_url}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {getStudyToolIcon(tool.type)}
                            <span className={`text-xs truncate flex-1 ${
                              isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}>
                              {tool.title}
                            </span>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
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
                  className={`w-full justify-start text-left ${isMobile ? 'p-2 h-auto hover:bg-accent/30 rounded-md' : 'p-2 h-auto hover:bg-accent rounded-md'} touch-manipulation`}
                  onClick={() => !isScrolling && onToggleTopics(course.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedTopics.has(course.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground flex-1">Topics</span>
                    <span className="text-xs text-muted-foreground">
                      {courseData.topics.length}
                    </span>
                  </div>
                </Button>

                {expandedTopics.has(course.id) && (
                  <div className="ml-6 space-y-1 min-w-0">
                    {courseData.topics.map((topic: Topic, index: number) => {
                      const topicSlides = courseData.slides[topic.id] || []
                      const topicVideos = courseData.videos[topic.id] || []

                      return (
                        <div key={topic.id} className="min-w-0">
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[44px]' : 'px-3 py-2.5'} h-auto min-w-0 sidebar-item-professional touch-manipulation rounded-md ${
                              expandedTopicItems.has(topic.id)
                                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                : 'hover:bg-accent/70'
                            }`}
                            onClick={() => !isScrolling && onToggleTopicItem(topic.id, course.id)}
                          >
                            <div className="flex items-start gap-2.5 w-full min-w-0">
                              {expandedTopicItems.has(topic.id) ? (
                                <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} text-muted-foreground flex-shrink-0 mt-0.5`} />
                              ) : (
                                <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} text-muted-foreground flex-shrink-0 mt-0.5`} />
                              )}
                              <div className="flex-1 min-w-0 break-words">
                                <ProfessionalTopicTitle
                                  index={index}
                                  title={topic.title}
                                  maxLength={isMobile ? 45 : 50}
                                  variant={isMobile ? "compact" : "default"}
                                  className={`${expandedTopicItems.has(topic.id) ? "text-primary font-semibold" : "text-foreground"} break-words leading-relaxed`}
                                />
                              </div>
                              {(topicSlides.length > 0 || topicVideos.length > 0) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground/70 flex-shrink-0">
                                  {topicVideos.length > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <Play className="h-2.5 w-2.5" />
                                      {topicVideos.length}
                                    </span>
                                  )}
                                  {topicSlides.length > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <FileText className="h-2.5 w-2.5" />
                                      {topicSlides.length}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Button>

                          {expandedTopicItems.has(topic.id) && (
                            <div className={`${isMobile ? 'ml-4' : 'ml-6'} space-y-1.5 topic-content-enter-active mt-2 min-w-0`}>
                              {/* Videos */}
                              {topicVideos.map((video: Video) => {
                                const isSelected = selectedContentId === video.id
                                return (
                                  <Button
                                    key={video.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-colors touch-manipulation min-w-0 ${
                                      isSelected
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
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
                                    <div className="flex items-start gap-2.5 w-full min-w-0">
                                      <Play className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${isSelected ? "text-red-500" : "text-red-400"}`} />
                                      <span className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 flex-1 ${
                                        isSelected ? "font-medium text-foreground" : ""
                                      }`}
                                      style={{ 
                                        wordBreak: 'break-word',
                                        overflowWrap: 'anywhere',
                                        hyphens: 'auto'
                                      }}>
                                        {video.title}
                                      </span>
                                    </div>
                                  </Button>
                                )
                              })}

                              {/* Slides */}
                              {topicSlides.map((slide: Slide) => {
                                const isSelected = selectedContentId === slide.id
                                return (
                                  <Button
                                    key={slide.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-colors touch-manipulation min-w-0 ${
                                      isSelected
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
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
                                    <div className="flex items-start gap-2.5 w-full min-w-0">
                                      <FileText className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${isSelected ? "text-blue-500" : "text-blue-400"}`} />
                                      <span className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 flex-1 ${
                                        isSelected ? "font-medium text-foreground" : ""
                                      }`}
                                      style={{ 
                                        wordBreak: 'break-word',
                                        overflowWrap: 'anywhere',
                                        hyphens: 'auto'
                                      }}>
                                        {slide.title}
                                      </span>
                                    </div>
                                  </Button>
                                )
                              })}

                              {topicSlides.length === 0 && topicVideos.length === 0 && (
                                <div className="text-xs text-muted-foreground py-4 text-center italic">
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
