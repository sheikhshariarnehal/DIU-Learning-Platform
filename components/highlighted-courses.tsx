"use client"

import { useState, useEffect } from "react"
import { Star, BookOpen, User, Calendar, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HighlightedCourse {
  id: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  description?: string
  credits?: number
  is_highlighted: boolean
  created_at: string
  updated_at: string
  semester: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
}

interface HighlightedCoursesProps {
  onCourseSelect?: (courseId: string) => void
  className?: string
}

export function HighlightedCourses({ onCourseSelect, className = "" }: HighlightedCoursesProps) {
  const [highlightedCourses, setHighlightedCourses] = useState<HighlightedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHighlightedCourses()
  }, [])

  const fetchHighlightedCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/courses/highlighted')
      if (!response.ok) {
        throw new Error('Failed to fetch highlighted courses')
      }

      const data = await response.json()
      setHighlightedCourses(data)
    } catch (err) {
      console.error('Error fetching highlighted courses:', err)
      setError('Failed to load featured courses')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            Featured Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
            Featured Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (highlightedCourses.length === 0) {
    return null // Don't show the section if there are no highlighted courses
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
          Featured Courses
          <Badge variant="secondary" className="ml-auto">
            {highlightedCourses.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {highlightedCourses.map((course) => (
              <Card
                key={course.id}
                className="group cursor-pointer relative overflow-hidden
                  bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20
                  border border-blue-200/60 border-l-4 border-l-blue-500
                  shadow-[0_2px_8px_-2px_rgba(59,130,246,0.15),0_4px_16px_-4px_rgba(59,130,246,0.1)]
                  hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.25),0_8px_16px_-8px_rgba(59,130,246,0.15)]
                  hover:border-blue-300/70 hover:-translate-y-1
                  transition-all duration-500 ease-out
                  dark:bg-gradient-to-br dark:from-[#35374B] dark:via-[#344955]/80 dark:to-[#50727B]/40
                  dark:border-[#50727B]/60 dark:border-l-[#50727B]
                  dark:shadow-[0_4px_12px_-2px_rgba(80,114,123,0.4),0_8px_24px_-4px_rgba(53,55,75,0.5)]
                  dark:hover:shadow-[0_12px_32px_-4px_rgba(80,114,123,0.6),0_16px_40px_-8px_rgba(53,55,75,0.6)]
                  dark:hover:border-[#50727B]/80 dark:hover:shadow-[0_0_40px_rgba(80,114,123,0.3)]"
                onClick={() => onCourseSelect?.(course.id)}
              >
                <CardContent className="p-0 relative">
                  {/* Subtle top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-[#50727B]/70"></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Course Title and Code */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight mb-2 tracking-tight">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="text-xs font-semibold px-3 py-1.5
                                  bg-gradient-to-r from-blue-100 to-blue-50
                                  text-blue-800 border border-blue-200/60
                                  shadow-sm hover:shadow-md transition-shadow
                                  dark:bg-gradient-to-r dark:from-[#50727B]/60 dark:to-[#344955]/80
                                  dark:text-[#78A083] dark:border-[#50727B]/40
                                  dark:shadow-[0_2px_8px_-2px_rgba(80,114,123,0.4)]
                                  dark:hover:shadow-[0_4px_12px_-2px_rgba(80,114,123,0.5)]"
                              >
                                {course.course_code}
                              </Badge>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                  {course.semester.title} • {course.semester.section}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Instructor Information */}
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl
                          bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/60
                          dark:bg-gradient-to-r dark:from-[#344955]/60 dark:to-[#50727B]/30
                          dark:border-[#50727B]/40 dark:shadow-[0_2px_8px_-2px_rgba(53,55,75,0.4)]">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#50727B] via-[#344955] to-[#35374B] rounded-xl flex items-center justify-center
                            shadow-lg shadow-[#50727B]/25 dark:shadow-[#50727B]/50">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                              {course.teacher_name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              Course Instructor
                            </p>
                          </div>
                          <div className="w-2 h-2 bg-green-400 dark:bg-[#78A083] rounded-full shadow-sm dark:shadow-[#78A083]/40"></div>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-3 rounded-lg
                            bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40
                            dark:bg-gradient-to-br dark:from-[#50727B]/40 dark:to-[#344955]/60
                            dark:border-[#50727B]/40 dark:shadow-[0_2px_8px_-2px_rgba(80,114,123,0.3)]">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#50727B] to-[#344955] rounded-lg flex items-center justify-center
                              shadow-sm dark:shadow-[#50727B]/40">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-blue-800 dark:text-slate-100 leading-none">8</p>
                              <p className="text-xs font-medium text-blue-600 dark:text-slate-300">Topics</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg
                            bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/40
                            dark:bg-gradient-to-br dark:from-[#78A083]/40 dark:to-[#50727B]/30
                            dark:border-[#78A083]/40 dark:shadow-[0_2px_8px_-2px_rgba(120,160,131,0.3)]">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#78A083] to-[#50727B] rounded-lg flex items-center justify-center
                              shadow-sm dark:shadow-[#78A083]/40">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-emerald-800 dark:text-slate-100 leading-none">10</p>
                              <p className="text-xs font-medium text-emerald-600 dark:text-slate-300">Slides</p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {course.description && (
                          <div className="p-4 rounded-xl
                            bg-gradient-to-r from-slate-50/80 to-white border border-slate-200/50
                            dark:bg-gradient-to-r dark:from-[#344955]/60 dark:to-[#35374B]/80
                            dark:border-[#50727B]/40 dark:shadow-[0_2px_8px_-2px_rgba(53,55,75,0.4)]">
                            <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed font-medium">
                              {course.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Indicator */}
                      <div className="flex flex-col items-center gap-3 ml-6">
                        <div className="relative">
                          <div className="w-4 h-4 bg-gradient-to-br from-[#78A083] via-[#50727B] to-[#344955] rounded-full
                            shadow-lg shadow-[#78A083]/30 dark:shadow-[#78A083]/60"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-[#78A083] via-[#50727B] to-[#344955]
                            rounded-full animate-ping opacity-20 dark:opacity-40"></div>
                        </div>
                        <div className="p-2 rounded-full
                          bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/40
                          group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100
                          dark:bg-gradient-to-br dark:from-[#50727B]/40 dark:to-[#344955]/60
                          dark:border-[#50727B]/40 dark:group-hover:from-[#50727B]/60 dark:group-hover:to-[#344955]/80
                          dark:shadow-[0_2px_8px_-2px_rgba(80,114,123,0.4)]
                          transition-all duration-300">
                          <ChevronRight className="h-5 w-5 text-blue-600 dark:text-[#78A083]
                            group-hover:text-blue-700 dark:group-hover:text-slate-100
                            group-hover:translate-x-0.5 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
