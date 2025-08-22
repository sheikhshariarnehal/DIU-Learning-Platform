"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Play,
  Upload,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Users,
  Clock,
  GraduationCap
} from "lucide-react"

interface SemesterDetails {
  semester: {
    id: string
    title: string
    description: string
    section: string
    has_midterm: boolean
    has_final: boolean
    start_date: string | null
    end_date: string | null
    created_at: string
    updated_at: string
  }
  courses: Array<{
    id: string
    title: string
    course_code: string
    teacher_name: string
    teacher_email?: string
    credits?: number
    description?: string
    topics: Array<{
      id: string
      title: string
      description: string
      order_index: number
      slides: Array<{
        id: string
        title: string
        url: string
      }>
      videos: Array<{
        id: string
        title: string
        url: string
        duration?: string
      }>
    }>
    studyTools: Array<{
      id: string
      title: string
      type: string
      content_url: string
      exam_type: string
      description?: string
    }>
  }>
}

interface EnhancedCreatorViewProps {
  semesterId: string
}

export function EnhancedCreatorView({ semesterId }: EnhancedCreatorViewProps) {
  const router = useRouter()
  const [data, setData] = useState<SemesterDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSemesterData = async () => {
      try {
        const response = await fetch(`/api/admin/all-in-one/${semesterId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Semester not found")
          }
          throw new Error("Failed to load semester data")
        }

        const semesterData = await response.json()
        setData(semesterData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(errorMessage)
        toast.error(`Failed to load semester: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadSemesterData()
  }, [semesterId])

  const handleEdit = () => {
    router.push(`/admin/enhanced-creator/edit/${semesterId}`)
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/admin/enhanced-creator/duplicate/${semesterId}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to duplicate semester')
      
      const result = await response.json()
      toast.success(`Successfully duplicated semester: ${result.title}`)
      router.push('/admin/enhanced-creator/list')
    } catch (error) {
      console.error('Error duplicating semester:', error)
      toast.error('Failed to duplicate semester')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${data?.semester.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete semester')
      
      toast.success('Semester deleted successfully')
      router.push('/admin/enhanced-creator/list')
    } catch (error) {
      console.error('Error deleting semester:', error)
      toast.error('Failed to delete semester')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading semester details...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h2 className="text-xl font-semibold">Error Loading Semester</h2>
          <p>{error || "Semester not found"}</p>
        </div>
        <Button onClick={() => router.push('/admin/enhanced-creator/list')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
    )
  }

  const { semester, courses } = data

  // Calculate statistics
  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0)
  const totalSlides = courses.reduce((sum, course) => 
    sum + course.topics.reduce((topicSum, topic) => topicSum + topic.slides.length, 0), 0)
  const totalVideos = courses.reduce((sum, course) => 
    sum + course.topics.reduce((topicSum, topic) => topicSum + topic.videos.length, 0), 0)
  const totalStudyTools = courses.reduce((sum, course) => sum + course.studyTools.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/enhanced-creator/list')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{semester.title}</h1>
            <p className="text-muted-foreground">Section: {semester.section}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Semester Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Semester Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Title:</strong> {semester.title}</div>
                  <div><strong>Section:</strong> {semester.section}</div>
                  <div><strong>Description:</strong> {semester.description || "No description"}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Exam Configuration</h4>
                <div className="flex gap-2">
                  {semester.has_midterm && <Badge variant="secondary">Midterm Exam</Badge>}
                  {semester.has_final && <Badge variant="secondary">Final Exam</Badge>}
                  {!semester.has_midterm && !semester.has_final && (
                    <Badge variant="outline">No Exams Configured</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Start Date:</strong> {semester.start_date ? new Date(semester.start_date).toLocaleDateString() : "Not set"}</div>
                  <div><strong>End Date:</strong> {semester.end_date ? new Date(semester.end_date).toLocaleDateString() : "Not set"}</div>
                  <div><strong>Created:</strong> {new Date(semester.created_at).toLocaleDateString()}</div>
                  <div><strong>Last Updated:</strong> {new Date(semester.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{courses.length}</div>
            <div className="text-sm text-muted-foreground">Courses</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{totalTopics}</div>
            <div className="text-sm text-muted-foreground">Topics</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{totalSlides + totalVideos}</div>
            <div className="text-sm text-muted-foreground">Materials</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <ClipboardList className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{totalStudyTools}</div>
            <div className="text-sm text-muted-foreground">Study Tools</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses ({courses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found in this semester</p>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((course, index) => (
                <div key={course.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.course_code} • {course.teacher_name}
                        {course.teacher_email && ` • ${course.teacher_email}`}
                      </p>
                      {course.description && (
                        <p className="text-sm mt-2">{course.description}</p>
                      )}
                    </div>
                    <Badge variant="outline">Course {index + 1}</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Topics */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Topics ({course.topics.length})
                      </h4>
                      {course.topics.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No topics</p>
                      ) : (
                        <div className="space-y-2">
                          {course.topics.map((topic) => (
                            <div key={topic.id} className="text-sm p-2 bg-muted rounded">
                              <div className="font-medium truncate" title={topic.title}>{topic.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {topic.slides.length} slides, {topic.videos.length} videos
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Study Tools */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Study Tools ({course.studyTools.length})
                      </h4>
                      {course.studyTools.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No study tools</p>
                      ) : (
                        <div className="space-y-2">
                          {course.studyTools.map((tool) => (
                            <div key={tool.id} className="text-sm p-2 bg-muted rounded">
                              <div className="font-medium">{tool.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {tool.type} • {tool.exam_type}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {course.topics.length} Topics
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="h-3 w-3" />
                          {course.topics.reduce((sum, topic) => sum + topic.slides.length, 0)} Slides
                        </div>
                        <div className="flex items-center gap-2">
                          <Play className="h-3 w-3" />
                          {course.topics.reduce((sum, topic) => sum + topic.videos.length, 0)} Videos
                        </div>
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-3 w-3" />
                          {course.studyTools.length} Study Tools
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
