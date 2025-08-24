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
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onCourseSelect?.(course.id)}
              >
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {course.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {course.course_code}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {course.teacher_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {course.semester.title} ({course.semester.section})
                        </div>
                      </div>

                      {course.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
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
