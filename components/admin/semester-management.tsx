"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { generateDemoSemester } from "@/utils/semester-demo-data"
import {
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  Save,
  X,
  GraduationCap,
  Play,
  Link,
  Upload
} from "lucide-react"

// Enhanced interfaces for semester management
interface SemesterData {
  id?: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  start_date?: string
  end_date?: string
  default_credits?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

interface CourseData {
  id?: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
  topics: TopicData[]
  studyTools: StudyToolData[]
}

interface TopicData {
  id?: string
  title: string
  description: string
  order_index?: number
  slides: { id?: string; title: string; url: string; description?: string }[]
  videos: { id?: string; title: string; url: string; description?: string }[]
}

interface StudyToolData {
  id?: string
  title: string
  type: string
  content_url: string
  exam_type: string
  description?: string
}

interface SemesterSummary extends SemesterData {
  courses_count: number
  topics_count: number
  materials_count: number
  study_tools_count: number
}

interface AllInOneData {
  semester: SemesterData
  courses: CourseData[]
}

type SortField = 'title' | 'section' | 'created_at' | 'updated_at' | 'courses_count'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'create' | 'edit'

export function SemesterManagement() {
  const router = useRouter()

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterSection, setFilterSection] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingSemester, setEditingSemester] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [expandedTopic, setExpandedTopic] = useState<{ courseIndex: number; topicIndex: number } | null>(null)

  // Form data for create/edit
  const [formData, setFormData] = useState<AllInOneData>({
    semester: {
      title: "",
      description: "",
      section: "",
      has_midterm: true,
      has_final: true,
      start_date: "",
      end_date: "",
      default_credits: 3,
      is_active: true
    },
    courses: []
  })

  // Load semesters data
  const loadSemesters = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/enhanced-creator/list')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      setSemesters(data.semesters || [])

      if (data.semesters?.length === 0) {
        toast.info('No semesters found. Create your first semester!')
      }
    } catch (error) {
      console.error('Error loading semesters:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to load semesters: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter and sort semesters
  useEffect(() => {
    let filtered = semesters.filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSection = filterSection === "all" || semester.section === filterSection
      const isActive = semester.is_active ?? true // Default to active if not set
      const matchesStatus = filterStatus === "all" ||
                           (filterStatus === "active" && isActive) ||
                           (filterStatus === "inactive" && !isActive)

      return matchesSearch && matchesSection && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle undefined values
      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredSemesters(filtered)
  }, [semesters, searchTerm, sortField, sortOrder, filterSection, filterStatus])

  // Get unique sections for filter
  const uniqueSections = Array.from(new Set(semesters.map(s => s.section))).sort()

  // Load data on mount
  useEffect(() => {
    loadSemesters()
  }, [loadSemesters])

  // Handle actions
  const handleCreate = () => {
    setFormData({
      semester: {
        title: "",
        description: "",
        section: "",
        has_midterm: true,
        has_final: true,
        start_date: "",
        end_date: "",
        default_credits: 3,
        is_active: true
      },
      courses: []
    })
    setEditingSemester(null)
    setExpandedCourse(null)
    setExpandedTopic(null)
    setViewMode('create')
  }

  const loadDemoData = () => {
    const demoData = generateDemoSemester()
    setFormData(demoData)
    setExpandedCourse(0) // Expand first course to show the content
    toast.success("Demo data loaded! You can now see a complete semester structure.")
  }

  const handleEdit = async (semesterId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`)

      if (!response.ok) {
        throw new Error('Failed to load semester data')
      }

      const data = await response.json()
      // Ensure is_active defaults to true if not set
      if (data.semester && data.semester.is_active === undefined) {
        data.semester.is_active = true
      }
      setFormData(data)
      setEditingSemester(semesterId)
      setViewMode('edit')
    } catch (error) {
      console.error('Error loading semester:', error)
      toast.error('Failed to load semester data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (semesterId: string) => {
    router.push(`/admin/enhanced-creator/view/${semesterId}`)
  }

  const handleDuplicate = async (semesterId: string) => {
    try {
      const response = await fetch(`/api/admin/enhanced-creator/duplicate/${semesterId}`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to duplicate semester')

      const result = await response.json()
      toast.success(`Successfully duplicated semester: ${result.title}`)
      loadSemesters() // Refresh list
    } catch (error) {
      console.error('Error duplicating semester:', error)
      toast.error('Failed to duplicate semester')
    }
  }

  const handleDelete = async (semesterId: string) => {
    setIsDeleting(semesterId)
    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete semester')

      toast.success('Semester deleted successfully')
      loadSemesters() // Refresh list
    } catch (error) {
      console.error('Error deleting semester:', error)
      toast.error('Failed to delete semester')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleStatus = async (semesterId: string, _currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/semesters/${semesterId}/toggle-status`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error('Failed to toggle semester status')
      }

      const result = await response.json()
      toast.success(result.data.message)

      // Update the local state
      setSemesters(prev => prev.map(semester =>
        semester.id === semesterId
          ? { ...semester, is_active: result.data.is_active }
          : semester
      ))
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to toggle semester status')
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  // Course management functions
  const addCourse = useCallback(() => {
    setFormData(prev => {
      const newCourseIndex = prev.courses.length
      setExpandedCourse(newCourseIndex) // Auto-expand the new course
      return {
        ...prev,
        courses: [
          ...prev.courses,
          {
            title: "",
            course_code: "",
            teacher_name: "",
            teacher_email: "",
            credits: 3,
            description: "",
            topics: [],
            studyTools: []
          }
        ]
      }
    })
  }, [])

  const removeCourse = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }))
    // Reset expanded course if it was the one being removed or adjust index
    if (expandedCourse === index) {
      setExpandedCourse(null)
    } else if (expandedCourse !== null && expandedCourse > index) {
      setExpandedCourse(expandedCourse - 1)
    }
    toast.success("Course removed")
  }, [expandedCourse])

  const updateCourse = useCallback((index: number, field: keyof CourseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === index ? { ...course, [field]: value } : course
      )
    }))
  }, [])

  // Topic management functions
  const addTopic = useCallback((courseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: [
                ...course.topics,
                {
                  title: "",
                  description: "",
                  order_index: course.topics.length,
                  slides: [],
                  videos: []
                }
              ]
            }
          : course
      )
    }))
    // Auto-expand the new topic
    const newTopicIndex = formData.courses[courseIndex].topics.length
    setExpandedTopic({ courseIndex, topicIndex: newTopicIndex })
  }, [formData.courses])

  const removeTopic = useCallback((courseIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.filter((_, ti) => ti !== topicIndex)
            }
          : course
      )
    }))
    // Reset expanded topic if it was the one being removed
    if (expandedTopic?.courseIndex === courseIndex && expandedTopic?.topicIndex === topicIndex) {
      setExpandedTopic(null)
    }
    toast.success("Topic removed")
  }, [expandedTopic])

  const updateTopic = useCallback((courseIndex: number, topicIndex: number, field: keyof TopicData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex ? { ...topic, [field]: value } : topic
              )
            }
          : course
      )
    }))
  }, [])

  // Slide management functions
  const addSlide = useCallback((courseIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      slides: [...topic.slides, { title: "", url: "", description: "" }]
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }, [])

  const removeSlide = useCallback((courseIndex: number, topicIndex: number, slideIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      slides: topic.slides.filter((_, si) => si !== slideIndex)
                    }
                  : topic
              )
            }
          : course
      )
    }))
    toast.success("Slide removed")
  }, [])

  const updateSlide = useCallback((courseIndex: number, topicIndex: number, slideIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      slides: topic.slides.map((slide, si) =>
                        si === slideIndex ? { ...slide, [field]: value } : slide
                      )
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }, [])

  // Video management functions
  const addVideo = useCallback((courseIndex: number, topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      videos: [...topic.videos, { title: "", url: "", description: "" }]
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }, [])

  const removeVideo = useCallback((courseIndex: number, topicIndex: number, videoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      videos: topic.videos.filter((_, vi) => vi !== videoIndex)
                    }
                  : topic
              )
            }
          : course
      )
    }))
    toast.success("Video removed")
  }, [])

  const updateVideo = useCallback((courseIndex: number, topicIndex: number, videoIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      videos: topic.videos.map((video, vi) =>
                        vi === videoIndex ? { ...video, [field]: value } : video
                      )
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }, [])

  // Study tool management functions
  const addStudyTool = useCallback((courseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              studyTools: [
                ...course.studyTools,
                {
                  title: "",
                  type: "previous_questions",
                  content_url: "",
                  exam_type: "both",
                  description: ""
                }
              ]
            }
          : course
      )
    }))
  }, [])

  const removeStudyTool = useCallback((courseIndex: number, toolIndex: number) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              studyTools: course.studyTools.filter((_, ti) => ti !== toolIndex)
            }
          : course
      )
    }))
    toast.success("Study tool removed")
  }, [])

  const updateStudyTool = useCallback((courseIndex: number, toolIndex: number, field: keyof StudyToolData, value: any) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              studyTools: course.studyTools.map((tool, ti) =>
                ti === toolIndex ? { ...tool, [field]: value } : tool
              )
            }
          : course
      )
    }))
  }, [])

  // URL validation functions
  const validateUrl = (url: string): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateGoogleUrl = (url: string): boolean => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      // Support all Google services and domains
      const googleDomainPattern = /^(drive|docs|sheets|forms|sites|calendar|meet|classroom|photos|maps|translate|scholar|books|news|mail|youtube|blogger|plus|hangouts|keep|jamboard|earth|chrome|play|store|pay|ads|analytics|search|trends|alerts|groups|contacts|voice|duo|allo|spaces|currents|my|accounts|support|developers|cloud|firebase|colab|datastudio|optimize|tagmanager|marketingplatform|admob|adsense|doubleclick|googleadservices|googlesyndication|googletagmanager|googleusercontent|gstatic|googleapis|appspot|firebaseapp|web\.app|page\.link|goo\.gl|g\.co)\.google\.com$/
      return googleDomainPattern.test(urlObj.hostname) || urlObj.hostname === 'google.com'
    } catch {
      return false
    }
  }

  // Validation functions
  const validateSemester = (semester: SemesterData): string[] => {
    const errors: string[] = []
    if (!semester.title?.trim()) errors.push("Semester title is required")
    if (!semester.section?.trim()) errors.push("Section is required")
    if (semester.start_date && semester.end_date && new Date(semester.start_date) >= new Date(semester.end_date)) {
      errors.push("Start date must be before end date")
    }
    return errors
  }

  const validateCourse = (course: CourseData): string[] => {
    const errors: string[] = []
    if (!course.title?.trim()) errors.push("Course title is required")
    if (!course.course_code?.trim()) errors.push("Course code is required")
    if (!course.teacher_name?.trim()) errors.push("Teacher name is required")
    if (course.teacher_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(course.teacher_email)) {
      errors.push("Invalid email format")
    }
    return errors
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsCreating(true)
    try {
      // Validate semester
      const semesterErrors = validateSemester(formData.semester)
      if (semesterErrors.length > 0) {
        toast.error(`Please fix the following errors:\n\n${semesterErrors.join('\n')}`)
        return
      }

      // Validate courses
      if (formData.courses.length === 0) {
        toast.error("At least one course is required")
        return
      }

      const allErrors: string[] = []

      // Validate courses and their content
      formData.courses.forEach((course, courseIndex) => {
        const courseErrors = validateCourse(course)
        if (courseErrors.length > 0) {
          allErrors.push(...courseErrors.map(error => `Course ${courseIndex + 1}: ${error}`))
        }

        // Validate topics
        course.topics.forEach((topic, topicIndex) => {
          if (!topic.title.trim()) {
            allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}: Title is required`)
          }

          // Validate slides
          topic.slides.forEach((slide, slideIndex) => {
            if (slide.title && !slide.url) {
              allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}, Slide ${slideIndex + 1}: URL is required when title is provided`)
            }
            if (slide.url) {
              if (!validateUrl(slide.url)) {
                allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}, Slide ${slideIndex + 1}: Invalid URL format`)
              } else if (!validateGoogleUrl(slide.url)) {
                allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}, Slide ${slideIndex + 1}: Please use a Google service URL (Drive, Docs, Sheets, etc.)`)
              }
            }
          })

          // Validate videos
          topic.videos.forEach((video, videoIndex) => {
            if (video.title && !video.url) {
              allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}, Video ${videoIndex + 1}: URL is required when title is provided`)
            }
            if (video.url && !validateUrl(video.url)) {
              allErrors.push(`Course ${courseIndex + 1}, Topic ${topicIndex + 1}, Video ${videoIndex + 1}: Invalid URL`)
            }
          })
        })

        // Validate study tools
        course.studyTools.forEach((tool, toolIndex) => {
          if (!tool.title.trim()) {
            allErrors.push(`Course ${courseIndex + 1}, Study Tool ${toolIndex + 1}: Title is required`)
          }
          if (!tool.type) {
            allErrors.push(`Course ${courseIndex + 1}, Study Tool ${toolIndex + 1}: Type is required`)
          }
          if (tool.content_url && !validateUrl(tool.content_url)) {
            allErrors.push(`Course ${courseIndex + 1}, Study Tool ${toolIndex + 1}: Invalid URL`)
          }
        })
      })

      if (allErrors.length > 0) {
        toast.error(`Please fix the following errors:\n\n${allErrors.slice(0, 5).join('\n')}${allErrors.length > 5 ? `\n... and ${allErrors.length - 5} more` : ''}`)
        return
      }

      const url = editingSemester ? `/api/admin/all-in-one/${editingSemester}` : "/api/admin/all-in-one"
      const method = editingSemester ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingSemester ? 'update' : 'create'} semester`)
      }

      if (editingSemester) {
        toast.success(`🎉 Successfully updated "${formData.semester.title}"!`)
      } else {
        const summary = result.data.summary
        toast.success(
          `🎉 Successfully created "${formData.semester.title}"!\n\n` +
          `📚 Semester: ${formData.semester.title}\n` +
          `📖 Courses: ${summary.courses_created}\n` +
          `📝 Topics: ${summary.topics_created}\n` +
          `📊 Slides: ${summary.slides_created}\n` +
          `🎥 Videos: ${summary.videos_created}\n` +
          `📋 Study Tools: ${summary.study_tools_created}`,
          { duration: 8000 }
        )
      }

      // Refresh the list and switch to list view
      await loadSemesters()
      setViewMode('list')
      setEditingSemester(null)
      setExpandedCourse(null)
      setExpandedTopic(null)
    } catch (error) {
      console.error(`Error ${editingSemester ? 'updating' : 'creating'} semester:`, error)
      toast.error(`Failed to ${editingSemester ? 'update' : 'create'} semester. Please try again.`)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading && viewMode === 'list') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading semester data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Semester Management
              </h1>
              <p className="text-blue-100">
                Create, edit, and manage semester structures with comprehensive tools
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                {filteredSemesters.length} of {semesters.length} semesters
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Semester List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!editingSemester}>
            <Edit3 className="h-4 w-4" />
            Edit Semester
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, section..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Section</Label>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {uniqueSections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Actions</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                    <Button variant="outline" onClick={loadSemesters} size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Semesters Table */}
          <Card>
            <CardHeader>
              <CardTitle>Semester Management</CardTitle>
              <CardDescription>
                All semesters with comprehensive management options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSemesters.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No semesters found</h3>
                  <p className="text-muted-foreground mb-4">
                    {semesters.length === 0
                      ? "Create your first semester to get started"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Semester
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort('title')}
                        >
                          <div className="flex items-center gap-2">
                            Semester {getSortIcon('title')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort('section')}
                        >
                          <div className="flex items-center gap-2">
                            Section {getSortIcon('section')}
                          </div>
                        </TableHead>
                        <TableHead>Content Summary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Exams</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort('updated_at')}
                        >
                          <div className="flex items-center gap-2">
                            Last Updated {getSortIcon('updated_at')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSemesters.map((semester) => (
                        <TableRow key={semester.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{semester.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {semester.description || "No description"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{semester.section}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <BookOpen className="h-3 w-3" />
                                {semester.courses_count} Courses
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <FileText className="h-3 w-3" />
                                {semester.topics_count} Topics
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <ClipboardList className="h-3 w-3" />
                                {semester.study_tools_count} Study Tools
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(semester.is_active ?? true) ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(semester.id!, semester.is_active ?? true)}
                                title={(semester.is_active ?? true) ? "Deactivate" : "Activate"}
                              >
                                {(semester.is_active ?? true) ? (
                                  <PowerOff className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Power className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {semester.has_midterm && (
                                <Badge variant="secondary" className="text-xs">Midterm</Badge>
                              )}
                              {semester.has_final && (
                                <Badge variant="secondary" className="text-xs">Final</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(semester.updated_at!).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(semester.updated_at!).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(semester.id!)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(semester.id!)}
                                title="Edit Semester"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(semester.id!)}
                                title="Duplicate Semester"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    title="Delete Semester"
                                  >
                                    {isDeleting === semester.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{semester.title}"?
                                      This will permanently remove the semester and all its courses,
                                      topics, slides, videos, and study tools. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(semester.id!)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create View */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Semester
                </div>
                <Button
                  onClick={loadDemoData}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Load Demo Data
                </Button>
              </CardTitle>
              <CardDescription>
                Create a new semester with courses, topics, and study materials. Use "Load Demo Data" to see a complete example.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Semester Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-semester-title" className="text-sm font-medium">
                      Semester Title *
                    </Label>
                    <Input
                      id="create-semester-title"
                      placeholder="e.g., Spring 2025"
                      value={formData.semester.title}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, title: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-semester-section" className="text-sm font-medium">
                      Section *
                    </Label>
                    <Input
                      id="create-semester-section"
                      placeholder="e.g., 63_G"
                      value={formData.semester.section}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, section: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-semester-credits" className="text-sm font-medium">
                      Default Credits
                    </Label>
                    <Input
                      id="create-semester-credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.semester.default_credits || 3}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, default_credits: parseInt(e.target.value) || 3 }
                      }))}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-start-date" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="create-start-date"
                      type="date"
                      value={formData.semester.start_date || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, start_date: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-end-date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Input
                      id="create-end-date"
                      type="date"
                      value={formData.semester.end_date || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, end_date: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Active Status</Label>
                        <p className="text-xs text-muted-foreground">Enable this semester</p>
                      </div>
                      <Switch
                        checked={formData.semester.is_active ?? true}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, is_active: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Midterm Exam</Label>
                        <p className="text-xs text-muted-foreground">Include midterm examination</p>
                      </div>
                      <Switch
                        checked={formData.semester.has_midterm}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, has_midterm: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Final Exam</Label>
                        <p className="text-xs text-muted-foreground">Include final examination</p>
                      </div>
                      <Switch
                        checked={formData.semester.has_final}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, has_final: checked }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-semester-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="create-semester-description"
                  placeholder="Describe this semester, its focus, and any special notes..."
                  value={formData.semester.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    semester: { ...prev.semester, description: e.target.value }
                  }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Course Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({formData.courses.length})
                  </h3>
                  <Button onClick={addCourse} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                {formData.courses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No courses added yet</p>
                    <Button onClick={addCourse} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.courses.map((course, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onClick={() => setExpandedCourse(expandedCourse === index ? null : index)}
                            >
                              <Badge variant="outline">Course {index + 1}</Badge>
                              <h4 className="font-medium">
                                {course.title || `Course ${index + 1}`}
                              </h4>
                              {/* Content completeness indicators */}
                              <div className="flex items-center gap-1 ml-2">
                                {course.topics.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                    {course.topics.length} Topics
                                  </Badge>
                                )}
                                {course.studyTools.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    {course.studyTools.length} Tools
                                  </Badge>
                                )}
                                {course.topics.reduce((sum, topic) => sum + topic.slides.length + topic.videos.length, 0) > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {course.topics.reduce((sum, topic) => sum + topic.slides.length + topic.videos.length, 0)} Materials
                                  </Badge>
                                )}
                              </div>
                              <div className="ml-auto">
                                {expandedCourse === index ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCourse(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {expandedCourse === index && (
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Title *</Label>
                                <Input
                                  placeholder="e.g., Internet of Things"
                                  value={course.title}
                                  onChange={(e) => updateCourse(index, "title", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Code *</Label>
                                <Input
                                  placeholder="e.g., CSE 422"
                                  value={course.course_code}
                                  onChange={(e) => updateCourse(index, "course_code", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Teacher Name *</Label>
                                <Input
                                  placeholder="e.g., Dr. Ahmed Rahman"
                                  value={course.teacher_name}
                                  onChange={(e) => updateCourse(index, "teacher_name", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Teacher Email</Label>
                                <Input
                                  type="email"
                                  placeholder="teacher@diu.edu.bd"
                                  value={course.teacher_email || ""}
                                  onChange={(e) => updateCourse(index, "teacher_email", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Course Description</Label>
                              <Textarea
                                placeholder="Brief description of the course content and objectives..."
                                value={course.description || ""}
                                onChange={(e) => updateCourse(index, "description", e.target.value)}
                                rows={3}
                                className="resize-none"
                              />
                            </div>
                            {/* Topics Section */}
                            <div className="space-y-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Topics ({course.topics.length})
                                </h5>
                                <Button
                                  onClick={() => addTopic(index)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Topic
                                </Button>
                              </div>

                              {course.topics.length === 0 ? (
                                <div className="text-center py-4 border border-dashed rounded-lg">
                                  <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                                  <p className="text-sm text-muted-foreground">No topics added yet</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {course.topics.map((topic, topicIndex) => (
                                    <Card key={topicIndex} className="border-l-2 border-l-purple-400">
                                      <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                          <div
                                            className="flex items-center gap-2 cursor-pointer flex-1"
                                            onClick={() => setExpandedTopic(
                                              expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex
                                                ? null
                                                : { courseIndex: index, topicIndex }
                                            )}
                                          >
                                            <Badge variant="secondary" className="text-xs">Topic {topicIndex + 1}</Badge>
                                            <span className="text-sm font-medium">
                                              {topic.title || `Topic ${topicIndex + 1}`}
                                            </span>
                                            <div className="ml-auto">
                                              {expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex ? (
                                                <X className="h-3 w-3" />
                                              ) : (
                                                <Plus className="h-3 w-3" />
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTopic(index, topicIndex)}
                                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      {expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex && (
                                        <CardContent className="space-y-4">
                                          <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                              <Label className="text-sm font-medium">Topic Title *</Label>
                                              <Input
                                                placeholder="e.g., Introduction to IoT"
                                                value={topic.title}
                                                onChange={(e) => updateTopic(index, topicIndex, "title", e.target.value)}
                                                className="h-9"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label className="text-sm font-medium">Order Index</Label>
                                              <Input
                                                type="number"
                                                min="0"
                                                value={topic.order_index || 0}
                                                onChange={(e) => updateTopic(index, topicIndex, "order_index", parseInt(e.target.value) || 0)}
                                                className="h-9"
                                              />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Description</Label>
                                            <Textarea
                                              placeholder="Describe this topic..."
                                              value={topic.description}
                                              onChange={(e) => updateTopic(index, topicIndex, "description", e.target.value)}
                                              rows={2}
                                              className="resize-none"
                                            />
                                          </div>

                                          {/* Slides Section */}
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h6 className="text-sm font-medium">Slides ({topic.slides.length})</h6>
                                              <Button
                                                onClick={() => addSlide(index, topicIndex)}
                                                size="sm"
                                                variant="outline"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Slide
                                              </Button>
                                            </div>
                                            {topic.slides.map((slide, slideIndex) => (
                                              <div key={slideIndex} className="grid gap-2 md:grid-cols-3 p-3 border rounded-lg">
                                                <Input
                                                  placeholder="Slide title"
                                                  value={slide.title}
                                                  onChange={(e) => updateSlide(index, topicIndex, slideIndex, "title", e.target.value)}
                                                  className="h-8"
                                                />
                                                <Input
                                                  placeholder="Google Drive/Docs URL"
                                                  value={slide.url}
                                                  onChange={(e) => updateSlide(index, topicIndex, slideIndex, "url", e.target.value)}
                                                  className="h-8"
                                                />
                                                <div className="flex gap-1">
                                                  <Input
                                                    placeholder="Description"
                                                    value={slide.description || ""}
                                                    onChange={(e) => updateSlide(index, topicIndex, slideIndex, "description", e.target.value)}
                                                    className="h-8 flex-1"
                                                  />
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSlide(index, topicIndex, slideIndex)}
                                                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {/* Videos Section */}
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h6 className="text-sm font-medium">Videos ({topic.videos.length})</h6>
                                              <Button
                                                onClick={() => addVideo(index, topicIndex)}
                                                size="sm"
                                                variant="outline"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Video
                                              </Button>
                                            </div>
                                            {topic.videos.map((video, videoIndex) => (
                                              <div key={videoIndex} className="grid gap-2 md:grid-cols-3 p-3 border rounded-lg">
                                                <Input
                                                  placeholder="Video title"
                                                  value={video.title}
                                                  onChange={(e) => updateVideo(index, topicIndex, videoIndex, "title", e.target.value)}
                                                  className="h-8"
                                                />
                                                <Input
                                                  placeholder="YouTube/Video URL"
                                                  value={video.url}
                                                  onChange={(e) => updateVideo(index, topicIndex, videoIndex, "url", e.target.value)}
                                                  className="h-8"
                                                />
                                                <div className="flex gap-1">
                                                  <Input
                                                    placeholder="Description"
                                                    value={video.description || ""}
                                                    onChange={(e) => updateVideo(index, topicIndex, videoIndex, "description", e.target.value)}
                                                    className="h-8 flex-1"
                                                  />
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVideo(index, topicIndex, videoIndex)}
                                                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Study Tools Section */}
                            <div className="space-y-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium flex items-center gap-2">
                                  <ClipboardList className="h-4 w-4" />
                                  Study Tools ({course.studyTools.length})
                                </h5>
                                <Button
                                  onClick={() => addStudyTool(index)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Study Tool
                                </Button>
                              </div>

                              {course.studyTools.length === 0 ? (
                                <div className="text-center py-4 border border-dashed rounded-lg">
                                  <ClipboardList className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                                  <p className="text-sm text-muted-foreground">No study tools added yet</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {course.studyTools.map((tool, toolIndex) => (
                                    <div key={toolIndex} className="p-3 border rounded-lg space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">Tool {toolIndex + 1}</Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeStudyTool(index, toolIndex)}
                                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Title *</Label>
                                          <Input
                                            placeholder="e.g., Previous Questions"
                                            value={tool.title}
                                            onChange={(e) => updateStudyTool(index, toolIndex, "title", e.target.value)}
                                            className="h-8"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Type</Label>
                                          <Select
                                            value={tool.type}
                                            onValueChange={(value) => updateStudyTool(index, toolIndex, "type", value)}
                                          >
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="previous_questions">Previous Questions</SelectItem>
                                              <SelectItem value="exam_notes">Exam Notes</SelectItem>
                                              <SelectItem value="syllabus">Syllabus</SelectItem>
                                              <SelectItem value="mark_distribution">Mark Distribution</SelectItem>
                                              <SelectItem value="reference_books">Reference Books</SelectItem>
                                              <SelectItem value="assignments">Assignments</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Content URL</Label>
                                          <Input
                                            placeholder="https://..."
                                            value={tool.content_url}
                                            onChange={(e) => updateStudyTool(index, toolIndex, "content_url", e.target.value)}
                                            className="h-8"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Exam Type</Label>
                                          <Select
                                            value={tool.exam_type}
                                            onValueChange={(value) => updateStudyTool(index, toolIndex, "exam_type", value)}
                                          >
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="both">Both Exams</SelectItem>
                                              <SelectItem value="midterm">Midterm Only</SelectItem>
                                              <SelectItem value="final">Final Only</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Description</Label>
                                        <Textarea
                                          placeholder="Describe this study tool..."
                                          value={tool.description || ""}
                                          onChange={(e) => updateStudyTool(index, toolIndex, "description", e.target.value)}
                                          rows={2}
                                          className="resize-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('list')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating || !formData.semester.title || !formData.semester.section}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Semester
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit View */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Edit Semester: {formData.semester.title}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={loadDemoData}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Load Demo Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/enhanced-creator/edit/${editingSemester}`)}
                    className="text-xs"
                  >
                    <Link className="h-3 w-3 mr-1" />
                    Enhanced Editor
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Modify semester details and structure. Use "Enhanced Editor" for advanced features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Semester Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-semester-title" className="text-sm font-medium">
                      Semester Title *
                    </Label>
                    <Input
                      id="edit-semester-title"
                      placeholder="e.g., Spring 2025"
                      value={formData.semester.title}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, title: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-semester-section" className="text-sm font-medium">
                      Section *
                    </Label>
                    <Input
                      id="edit-semester-section"
                      placeholder="e.g., 63_G"
                      value={formData.semester.section}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, section: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-semester-credits" className="text-sm font-medium">
                      Default Credits
                    </Label>
                    <Input
                      id="edit-semester-credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.semester.default_credits || 3}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, default_credits: parseInt(e.target.value) || 3 }
                      }))}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={formData.semester.start_date || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, start_date: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={formData.semester.end_date || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, end_date: e.target.value }
                      }))}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Active Status</Label>
                        <p className="text-xs text-muted-foreground">Enable this semester</p>
                      </div>
                      <Switch
                        checked={formData.semester.is_active ?? true}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, is_active: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Midterm Exam</Label>
                        <p className="text-xs text-muted-foreground">Include midterm examination</p>
                      </div>
                      <Switch
                        checked={formData.semester.has_midterm}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, has_midterm: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Final Exam</Label>
                        <p className="text-xs text-muted-foreground">Include final examination</p>
                      </div>
                      <Switch
                        checked={formData.semester.has_final}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, has_final: checked }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-semester-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-semester-description"
                  placeholder="Describe this semester, its focus, and any special notes..."
                  value={formData.semester.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    semester: { ...prev.semester, description: e.target.value }
                  }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Course Management - Same as Create View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({formData.courses.length})
                  </h3>
                  <Button onClick={addCourse} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                {formData.courses.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No courses added yet</p>
                    <Button onClick={addCourse} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.courses.map((course, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onClick={() => setExpandedCourse(expandedCourse === index ? null : index)}
                            >
                              <Badge variant="outline">Course {index + 1}</Badge>
                              <h4 className="font-medium">
                                {course.title || `Course ${index + 1}`}
                              </h4>
                              {/* Content completeness indicators */}
                              <div className="flex items-center gap-1 ml-2">
                                {course.topics.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                    {course.topics.length} Topics
                                  </Badge>
                                )}
                                {course.studyTools.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                    {course.studyTools.length} Tools
                                  </Badge>
                                )}
                                {course.topics.reduce((sum, topic) => sum + topic.slides.length + topic.videos.length, 0) > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {course.topics.reduce((sum, topic) => sum + topic.slides.length + topic.videos.length, 0)} Materials
                                  </Badge>
                                )}
                              </div>
                              <div className="ml-auto">
                                {expandedCourse === index ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCourse(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {expandedCourse === index && (
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Title *</Label>
                                <Input
                                  placeholder="e.g., Internet of Things"
                                  value={course.title}
                                  onChange={(e) => updateCourse(index, "title", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Course Code *</Label>
                                <Input
                                  placeholder="e.g., CSE 422"
                                  value={course.course_code}
                                  onChange={(e) => updateCourse(index, "course_code", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Teacher Name *</Label>
                                <Input
                                  placeholder="e.g., Dr. Ahmed Rahman"
                                  value={course.teacher_name}
                                  onChange={(e) => updateCourse(index, "teacher_name", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Teacher Email</Label>
                                <Input
                                  type="email"
                                  placeholder="teacher@diu.edu.bd"
                                  value={course.teacher_email || ""}
                                  onChange={(e) => updateCourse(index, "teacher_email", e.target.value)}
                                  className="h-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Course Description</Label>
                              <Textarea
                                placeholder="Brief description of the course content and objectives..."
                                value={course.description || ""}
                                onChange={(e) => updateCourse(index, "description", e.target.value)}
                                rows={3}
                                className="resize-none"
                              />
                            </div>

                            {/* Topics Section - Same as Create View */}
                            <div className="space-y-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Topics ({course.topics.length})
                                </h5>
                                <Button
                                  onClick={() => addTopic(index)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Topic
                                </Button>
                              </div>

                              {course.topics.length === 0 ? (
                                <div className="text-center py-4 border border-dashed rounded-lg">
                                  <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                                  <p className="text-sm text-muted-foreground">No topics added yet</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {course.topics.map((topic, topicIndex) => (
                                    <Card key={topicIndex} className="border-l-2 border-l-purple-400">
                                      <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                          <div
                                            className="flex items-center gap-2 cursor-pointer flex-1"
                                            onClick={() => setExpandedTopic(
                                              expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex
                                                ? null
                                                : { courseIndex: index, topicIndex }
                                            )}
                                          >
                                            <Badge variant="secondary" className="text-xs">Topic {topicIndex + 1}</Badge>
                                            <span className="text-sm font-medium">
                                              {topic.title || `Topic ${topicIndex + 1}`}
                                            </span>
                                            <div className="ml-auto">
                                              {expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex ? (
                                                <X className="h-3 w-3" />
                                              ) : (
                                                <Plus className="h-3 w-3" />
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTopic(index, topicIndex)}
                                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </CardHeader>
                                      {expandedTopic?.courseIndex === index && expandedTopic?.topicIndex === topicIndex && (
                                        <CardContent className="space-y-4">
                                          <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                              <Label className="text-sm font-medium">Topic Title *</Label>
                                              <Input
                                                placeholder="e.g., Introduction to IoT"
                                                value={topic.title}
                                                onChange={(e) => updateTopic(index, topicIndex, "title", e.target.value)}
                                                className="h-9"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label className="text-sm font-medium">Order Index</Label>
                                              <Input
                                                type="number"
                                                min="0"
                                                value={topic.order_index || 0}
                                                onChange={(e) => updateTopic(index, topicIndex, "order_index", parseInt(e.target.value) || 0)}
                                                className="h-9"
                                              />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium">Description</Label>
                                            <Textarea
                                              placeholder="Describe this topic..."
                                              value={topic.description}
                                              onChange={(e) => updateTopic(index, topicIndex, "description", e.target.value)}
                                              rows={2}
                                              className="resize-none"
                                            />
                                          </div>

                                          {/* Slides Section */}
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h6 className="text-sm font-medium">Slides ({topic.slides.length})</h6>
                                              <Button
                                                onClick={() => addSlide(index, topicIndex)}
                                                size="sm"
                                                variant="outline"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Slide
                                              </Button>
                                            </div>
                                            {topic.slides.map((slide, slideIndex) => (
                                              <div key={slideIndex} className="grid gap-2 md:grid-cols-3 p-3 border rounded-lg">
                                                <Input
                                                  placeholder="Slide title"
                                                  value={slide.title}
                                                  onChange={(e) => updateSlide(index, topicIndex, slideIndex, "title", e.target.value)}
                                                  className="h-8"
                                                />
                                                <Input
                                                  placeholder="Google Drive/Docs URL"
                                                  value={slide.url}
                                                  onChange={(e) => updateSlide(index, topicIndex, slideIndex, "url", e.target.value)}
                                                  className="h-8"
                                                />
                                                <div className="flex gap-1">
                                                  <Input
                                                    placeholder="Description"
                                                    value={slide.description || ""}
                                                    onChange={(e) => updateSlide(index, topicIndex, slideIndex, "description", e.target.value)}
                                                    className="h-8 flex-1"
                                                  />
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSlide(index, topicIndex, slideIndex)}
                                                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {/* Videos Section */}
                                          <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h6 className="text-sm font-medium">Videos ({topic.videos.length})</h6>
                                              <Button
                                                onClick={() => addVideo(index, topicIndex)}
                                                size="sm"
                                                variant="outline"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Video
                                              </Button>
                                            </div>
                                            {topic.videos.map((video, videoIndex) => (
                                              <div key={videoIndex} className="grid gap-2 md:grid-cols-3 p-3 border rounded-lg">
                                                <Input
                                                  placeholder="Video title"
                                                  value={video.title}
                                                  onChange={(e) => updateVideo(index, topicIndex, videoIndex, "title", e.target.value)}
                                                  className="h-8"
                                                />
                                                <Input
                                                  placeholder="YouTube/Video URL"
                                                  value={video.url}
                                                  onChange={(e) => updateVideo(index, topicIndex, videoIndex, "url", e.target.value)}
                                                  className="h-8"
                                                />
                                                <div className="flex gap-1">
                                                  <Input
                                                    placeholder="Description"
                                                    value={video.description || ""}
                                                    onChange={(e) => updateVideo(index, topicIndex, videoIndex, "description", e.target.value)}
                                                    className="h-8 flex-1"
                                                  />
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeVideo(index, topicIndex, videoIndex)}
                                                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      )}
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Study Tools Section */}
                            <div className="space-y-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium flex items-center gap-2">
                                  <ClipboardList className="h-4 w-4" />
                                  Study Tools ({course.studyTools.length})
                                </h5>
                                <Button
                                  onClick={() => addStudyTool(index)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Study Tool
                                </Button>
                              </div>

                              {course.studyTools.length === 0 ? (
                                <div className="text-center py-4 border border-dashed rounded-lg">
                                  <ClipboardList className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-50" />
                                  <p className="text-sm text-muted-foreground">No study tools added yet</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {course.studyTools.map((tool, toolIndex) => (
                                    <div key={toolIndex} className="p-3 border rounded-lg space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs">Tool {toolIndex + 1}</Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeStudyTool(index, toolIndex)}
                                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Title *</Label>
                                          <Input
                                            placeholder="e.g., Previous Questions"
                                            value={tool.title}
                                            onChange={(e) => updateStudyTool(index, toolIndex, "title", e.target.value)}
                                            className="h-8"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Type</Label>
                                          <Select
                                            value={tool.type}
                                            onValueChange={(value) => updateStudyTool(index, toolIndex, "type", value)}
                                          >
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="previous_questions">Previous Questions</SelectItem>
                                              <SelectItem value="exam_notes">Exam Notes</SelectItem>
                                              <SelectItem value="syllabus">Syllabus</SelectItem>
                                              <SelectItem value="mark_distribution">Mark Distribution</SelectItem>
                                              <SelectItem value="reference_books">Reference Books</SelectItem>
                                              <SelectItem value="assignments">Assignments</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Content URL</Label>
                                          <Input
                                            placeholder="https://..."
                                            value={tool.content_url}
                                            onChange={(e) => updateStudyTool(index, toolIndex, "content_url", e.target.value)}
                                            className="h-8"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm font-medium">Exam Type</Label>
                                          <Select
                                            value={tool.exam_type}
                                            onValueChange={(value) => updateStudyTool(index, toolIndex, "exam_type", value)}
                                          >
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="both">Both Exams</SelectItem>
                                              <SelectItem value="midterm">Midterm Only</SelectItem>
                                              <SelectItem value="final">Final Only</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Description</Label>
                                        <Textarea
                                          placeholder="Describe this study tool..."
                                          value={tool.description || ""}
                                          onChange={(e) => updateStudyTool(index, toolIndex, "description", e.target.value)}
                                          rows={2}
                                          className="resize-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setViewMode('list')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating || !formData.semester.title || !formData.semester.section}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Semester
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}