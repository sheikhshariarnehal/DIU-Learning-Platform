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
                className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 dark:border-l-blue-400"
                onClick={() => onCourseSelect?.(course.id)}
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Course Title and Code */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              >
                                {course.course_code}
                              </Badge>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {course.semester.title} • {course.semester.section}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Instructor Information */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {course.teacher_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Course Instructor
                            </p>
                          </div>
                        </div>

                        {/* Course Stats */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              8 Topics
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              10 Slides
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {course.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        )}
                      </div>

                      {/* Action Indicator */}
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
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
