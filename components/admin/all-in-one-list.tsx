"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Calendar,
  BookOpen,
  FileText,
  Play,
  Video,
  Presentation,
  ClipboardList,
  Edit,
  Trash2,
  Search,
  Plus,
  Eye,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SemesterWithDetails {
  id: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  created_at: string
  courses: {
    id: string
    title: string
    course_code: string
    teacher_name: string
    topics_count: number
    slides_count: number
    videos_count: number
    study_tools_count: number
  }[]
  total_courses: number
  total_topics: number
  total_slides: number
  total_videos: number
  total_study_tools: number
}

interface AllInOneListProps {
  onEdit?: (semesterId: string) => void
  onView?: (semesterId: string) => void
}

export function AllInOneList({ onEdit, onView }: AllInOneListProps) {
  const router = useRouter()
  const [semesters, setSemesters] = useState<SemesterWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    setLoading(true)
    try {
      // Fetch semesters with their courses and content counts
      const { data: semesterData, error: semesterError } = await supabase
        .from("semesters")
        .select(`
          id,
          title,
          description,
          section,
          has_midterm,
          has_final,
          created_at,
          courses (
            id,
            title,
            course_code,
            teacher_name
          )
        `)
        .order("created_at", { ascending: false })

      if (semesterError) throw semesterError

      // For each semester, get detailed counts
      const semestersWithDetails = await Promise.all(
        (semesterData || []).map(async (semester) => {
          const courseDetails = await Promise.all(
            semester.courses.map(async (course) => {
              // Get topics count and content counts for this course
              const [topicsResult, slidesResult, videosResult, studyToolsResult] = await Promise.all([
                supabase.from("topics").select("id", { count: "exact" }).eq("course_id", course.id),
                supabase.from("slides").select("id", { count: "exact" }).in("topic_id", 
                  await supabase.from("topics").select("id").eq("course_id", course.id).then(r => 
                    r.data?.map(t => t.id) || []
                  )
                ),
                supabase.from("videos").select("id", { count: "exact" }).in("topic_id",
                  await supabase.from("topics").select("id").eq("course_id", course.id).then(r => 
                    r.data?.map(t => t.id) || []
                  )
                ),
                supabase.from("study_tools").select("id", { count: "exact" }).eq("course_id", course.id)
              ])

              return {
                ...course,
                topics_count: topicsResult.count || 0,
                slides_count: slidesResult.count || 0,
                videos_count: videosResult.count || 0,
                study_tools_count: studyToolsResult.count || 0
              }
            })
          )

          // Calculate totals
          const totals = courseDetails.reduce(
            (acc, course) => ({
              total_courses: acc.total_courses + 1,
              total_topics: acc.total_topics + course.topics_count,
              total_slides: acc.total_slides + course.slides_count,
              total_videos: acc.total_videos + course.videos_count,
              total_study_tools: acc.total_study_tools + course.study_tools_count
            }),
            { total_courses: 0, total_topics: 0, total_slides: 0, total_videos: 0, total_study_tools: 0 }
          )

          return {
            ...semester,
            courses: courseDetails,
            ...totals
          }
        })
      )

      setSemesters(semestersWithDetails)
    } catch (error) {
      console.error("Error fetching semesters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (semesterId: string, semesterTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${semesterTitle}" and all its content? This action cannot be undone.`)) {
      return
    }

    setDeleting(semesterId)
    try {
      const { error } = await supabase
        .from("semesters")
        .delete()
        .eq("id", semesterId)

      if (error) throw error

      // Remove from local state
      setSemesters(prev => prev.filter(s => s.id !== semesterId))
      
    } catch (error) {
      console.error("Error deleting semester:", error)
      alert("Failed to delete semester. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  const filteredSemesters = semesters.filter(semester =>
    semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.courses.some(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading semesters...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search semesters, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => router.push("/admin/all-in-one/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Stats Summary */}
      {semesters.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.length}</p>
                  <p className="text-xs text-muted-foreground">Semesters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.reduce((sum, s) => sum + s.total_courses, 0)}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.reduce((sum, s) => sum + s.total_topics, 0)}</p>
                  <p className="text-xs text-muted-foreground">Topics</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Presentation className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.reduce((sum, s) => sum + s.total_slides + s.total_videos, 0)}</p>
                  <p className="text-xs text-muted-foreground">Content</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{semesters.reduce((sum, s) => sum + s.total_study_tools, 0)}</p>
                  <p className="text-xs text-muted-foreground">Study Tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Semesters List */}
      {filteredSemesters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? "No semesters found" : "No semesters created yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "Create your first semester using the All-in-One Creator"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push("/admin/all-in-one/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Semester
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSemesters.map((semester) => (
            <Card key={semester.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {semester.title}
                      <Badge variant="outline">{semester.section}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {semester.description || "No description"}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {semester.has_midterm && (
                        <Badge variant="secondary" className="text-xs">Midterm</Badge>
                      )}
                      {semester.has_final && (
                        <Badge variant="secondary" className="text-xs">Final</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onView && (
                      <Button variant="ghost" size="sm" onClick={() => onView(semester.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(semester.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(semester.id, semester.title)}
                      disabled={deleting === semester.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deleting === semester.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-5 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{semester.total_courses}</strong> courses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">
                      <strong>{semester.total_topics}</strong> topics
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Presentation className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">
                      <strong>{semester.total_slides}</strong> slides
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      <strong>{semester.total_videos}</strong> videos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>{semester.total_study_tools}</strong> tools
                    </span>
                  </div>
                </div>

                {/* Courses List */}
                {semester.courses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Courses:</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {semester.courses.map((course) => (
                        <div key={course.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{course.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.course_code} • {course.teacher_name}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {course.topics_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {course.topics_count}T
                                </Badge>
                              )}
                              {course.slides_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {course.slides_count}S
                                </Badge>
                              )}
                              {course.videos_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {course.videos_count}V
                                </Badge>
                              )}
                              {course.study_tools_count > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {course.study_tools_count}ST
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
