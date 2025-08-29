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
                  border-l-4 border-l-blue-500 dark:border-l-blue-400
                  bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10
                  shadow-sm hover:shadow-lg hover:-translate-y-1
                  hover:border-gray-300 dark:hover:border-gray-600
                  transition-all duration-300 ease-out"
                onClick={() => onCourseSelect?.(course.id)}
              >
                <CardContent className="p-0 relative">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Course Title and Code */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight tracking-tight">
                                {course.title}
                              </h3>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="text-xs font-medium px-2.5 py-1
                                  bg-blue-100 text-blue-800 border-blue-200
                                  dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                              >
                                {course.course_code}
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {course.semester.title} • {course.semester.section}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Instructor Information */}
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg
                          bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.teacher_name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Instructor
                            </p>
                          </div>
                        </div>

                        {/* Course Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-3 rounded-lg
                            bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 leading-none">8</p>
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Topics</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg
                            bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-green-900 dark:text-green-100 leading-none">10</p>
                              <p className="text-xs font-medium text-green-700 dark:text-green-300">Slides</p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {course.description && (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
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
