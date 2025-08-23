"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Check,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  ArrowRight,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Zap,
  Play,
  Sparkles,
  Clock,
  Users,
  Target,
  BarChart3,
  Link,
  Save
} from "lucide-react"

// Optimized interfaces
interface SemesterData {
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  start_date?: string
  end_date?: string
  credits?: number
}

interface CourseData {
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
}

interface TopicData {
  title: string
  description: string
  order_index?: number
  slides: { title: string; url: string }[]
  videos: { title: string; url: string; duration?: string }[]
}

interface StudyToolData {
  title: string
  type: string
  content_url: string
  exam_type: string
  description?: string
}

interface AllInOneData {
  semester: SemesterData
  courses: (CourseData & {
    id?: string
    topics: TopicData[]
    studyTools: StudyToolData[]
  })[]
}

interface EnhancedAllInOneCreatorProps {
  editId?: string
  mode?: "create" | "edit"
  onSuccess?: () => void
}

// Optimized validation functions
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

// Optimized form validation
const isFormReadyForSubmission = (data: AllInOneData): boolean => {
  return !!(
    data.semester?.title?.trim() &&
    data.semester?.section?.trim() &&
    data.courses?.length > 0 &&
    data.courses.every(course =>
      course.title?.trim() &&
      course.course_code?.trim() &&
      course.teacher_name?.trim()
    )
  )
}

export function EnhancedAllInOneCreator({ editId, mode = "create", onSuccess }: EnhancedAllInOneCreatorProps = {}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [previewMode, setPreviewMode] = useState(false)
  const [autoSave, setAutoSave] = useState(mode === "edit")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [creationSuccess, setCreationSuccess] = useState<{
    semesterTitle: string
    summary: any
  } | null>(null)

  const [data, setData] = useState<AllInOneData>({
    semester: {
      title: "",
      description: "",
      section: "",
      has_midterm: true,
      has_final: true,
      start_date: "",
      end_date: "",
      credits: 3
    },
    courses: []
  })

  // Memoized steps configuration
  const steps = useMemo(() => [
    {
      title: "Semester Setup",
      icon: Calendar,
      description: mode === "edit" ? "Edit semester information" : "Configure semester details",
      color: "bg-blue-500"
    },
    {
      title: "Course Management",
      icon: BookOpen,
      description: mode === "edit" ? "Edit courses" : "Add and configure courses",
      color: "bg-green-500"
    },
    {
      title: "Content Creation",
      icon: FileText,
      description: mode === "edit" ? "Edit topics and materials" : "Create topics, slides, and videos",
      color: "bg-purple-500"
    },
    {
      title: "Study Resources",
      icon: ClipboardList,
      description: mode === "edit" ? "Edit study materials" : "Add study tools and resources",
      color: "bg-orange-500"
    },
    {
      title: "Review & Publish",
      icon: Check,
      description: mode === "edit" ? "Review and update" : "Review and create everything",
      color: "bg-emerald-500"
    }
  ], [mode])

  // Memoized progress calculation
  const progress = useMemo(() => {
    let completed = 0
    const total = steps.length

    // Step 0: Semester
    if (data.semester?.title && data.semester?.section) completed++

    // Step 1: Courses
    if (data.courses?.length > 0 && data.courses.every(c => c.title && c.course_code && c.teacher_name)) completed++

    // Step 2: Content
    if (data.courses?.some(c => c.topics?.length > 0)) completed++

    // Step 3: Study Tools
    if (data.courses?.some(c => c.studyTools?.length > 0)) completed++

    // Step 4: Review
    if (completed >= 2) completed++

    return Math.min((completed / total) * 100, 100)
  }, [data, steps.length])

  // Optimized auto-save with useCallback
  const handleAutoSave = useCallback(async () => {
    if (mode !== "edit" || !editId || !isFormReadyForSubmission(data)) return

    try {
      const response = await fetch(`/api/admin/all-in-one/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, auto_save: true }),
      })

      if (response.ok) {
        setLastSaved(new Date())
        toast.success("Auto-saved", { duration: 1000 })
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }, [mode, editId, data])

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || mode !== "edit" || !editId) return

    const timer = setTimeout(handleAutoSave, 30000)
    return () => clearTimeout(timer)
  }, [autoSave, mode, editId, handleAutoSave])

  // Optimized data loading
  const loadExistingData = useCallback(async () => {
    if (!editId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/all-in-one/${editId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 404) {
          throw new Error("Semester not found")
        }
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const existingData = await response.json()

      // Validate the data structure
      if (!existingData.semester || !existingData.courses) {
        throw new Error("Invalid data format received")
      }

      setData(existingData)
      toast.success("Data loaded successfully")
    } catch (error) {
      console.error("Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load data"
      toast.error(`Failed to load data: ${errorMessage}`)

      // If semester not found, offer options
      if (errorMessage.includes("not found")) {
        toast.error("Semester not found", {
          duration: 5000,
          action: {
            label: "View All Semesters",
            onClick: () => router.push("/admin/enhanced-creator/list")
          }
        })

        // Show error state with navigation options
        setTimeout(() => {
          if (confirm("Semester not found. Would you like to view all semesters or create a new one?\n\nClick OK to view all semesters, Cancel to create new.")) {
            router.push("/admin/enhanced-creator/list")
          } else {
            router.push("/admin/enhanced-creator")
          }
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }, [editId])

  useEffect(() => {
    if (mode === "edit" && editId) {
      loadExistingData()
    }
  }, [mode, editId, loadExistingData])

  // Optimized course management
  const addCourse = useCallback(() => {
    setData(prev => ({
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
    }))
  }, [])

  const removeCourse = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }))
    toast.success("Course removed")
  }, [])

  const updateCourse = useCallback((index: number, field: keyof CourseData, value: any) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === index ? { ...course, [field]: value } : course
      )
    }))
  }, [])

  // Topic management functions
  const addTopic = (courseIndex: number) => {
    setData(prev => ({
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
  }

  const removeTopic = (courseIndex: number, topicIndex: number) => {
    setData(prev => ({
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
    toast.success("Topic removed")
  }

  const updateTopic = (courseIndex: number, topicIndex: number, field: keyof TopicData, value: any) => {
    setData(prev => ({
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
  }

  // Slide management functions
  const addSlide = (courseIndex: number, topicIndex: number) => {
    setData(prev => ({
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
  }

  const removeSlide = (courseIndex: number, topicIndex: number, slideIndex: number) => {
    setData(prev => ({
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
  }

  const updateSlide = (courseIndex: number, topicIndex: number, slideIndex: number, field: string, value: string) => {
    setData(prev => ({
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
  }

  // Video management functions
  const addVideo = (courseIndex: number, topicIndex: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, i) =>
        i === courseIndex
          ? {
              ...course,
              topics: course.topics.map((topic, ti) =>
                ti === topicIndex
                  ? {
                      ...topic,
                      videos: [...topic.videos, { title: "", url: "", description: "", duration: "" }]
                    }
                  : topic
              )
            }
          : course
      )
    }))
  }

  const removeVideo = (courseIndex: number, topicIndex: number, videoIndex: number) => {
    setData(prev => ({
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
  }

  const updateVideo = (courseIndex: number, topicIndex: number, videoIndex: number, field: string, value: string) => {
    setData(prev => ({
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
  }

  // Study tool management functions
  const addStudyTool = (courseIndex: number) => {
    setData(prev => ({
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
  }

  const removeStudyTool = (courseIndex: number, toolIndex: number) => {
    setData(prev => ({
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
  }

  const updateStudyTool = (courseIndex: number, toolIndex: number, field: keyof StudyToolData, value: any) => {
    setData(prev => ({
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
  }

  // Navigation functions
  const nextStep = () => {
    // Validate current step before proceeding
    const errors = validateCurrentStep()
    if (errors.length > 0) {
      setValidationErrors({ [currentStep]: errors })
      toast.error(`Please fix the following errors:\n\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n... and ${errors.length - 3} more` : ''}`)
      return
    }

    setValidationErrors({})
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = (): string[] => {
    switch (currentStep) {
      case 0:
        return validateSemester(data.semester)
      case 1:
        if (data.courses.length === 0) return ["At least one course is required"]
        return data.courses.flatMap((course, index) =>
          validateCourse(course).map(error => `Course ${index + 1}: ${error}`)
        )
      case 2:
        const contentErrors: string[] = []
        data.courses.forEach((course, ci) => {
          course.topics.forEach((topic, ti) => {
            if (!topic.title.trim()) {
              contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}: Title is required`)
            }
            topic.slides.forEach((slide, si) => {
              if (slide.title && !slide.url) {
                contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: URL is required when title is provided`)
              }
              if (slide.url) {
                if (!validateUrl(slide.url)) {
                  contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: Invalid URL format`)
                } else if (!validateGoogleUrl(slide.url)) {
                  contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: Please use a Google service URL (Drive, Docs, Sheets, etc.)`)
                }
              }
            })
            topic.videos.forEach((video, vi) => {
              if (video.title && !video.url) {
                contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Video ${vi + 1}: URL is required when title is provided`)
              }
              if (video.url && !validateUrl(video.url)) {
                contentErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Video ${vi + 1}: Invalid URL`)
              }
            })
          })
        })
        return contentErrors
      case 3:
        const toolErrors: string[] = []
        data.courses.forEach((course, ci) => {
          course.studyTools.forEach((tool, ti) => {
            if (!tool.title.trim()) {
              toolErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Title is required`)
            }
            if (!tool.type) {
              toolErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Type is required`)
            }
            if (tool.content_url && !validateUrl(tool.content_url)) {
              toolErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Invalid URL`)
            }
          })
        })
        return toolErrors
      default:
        return []
    }
  }

  // Handle final creation/update
  const handleCreateAll = async () => {
    // Validate all steps before submission
    const allErrors: string[] = []

    // Validate semester
    const semesterErrors = validateSemester(data.semester)
    if (semesterErrors.length > 0) {
      allErrors.push(...semesterErrors.map(error => `Semester: ${error}`))
    }

    // Validate courses
    if (data.courses.length === 0) {
      allErrors.push("At least one course is required")
    } else {
      data.courses.forEach((course, index) => {
        const courseErrors = validateCourse(course)
        if (courseErrors.length > 0) {
          allErrors.push(...courseErrors.map(error => `Course ${index + 1}: ${error}`))
        }
      })
    }

    // Validate content (topics, slides, videos)
    data.courses.forEach((course, ci) => {
      course.topics.forEach((topic, ti) => {
        if (!topic.title.trim()) {
          allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}: Title is required`)
        }
        topic.slides.forEach((slide, si) => {
          if (slide.title && !slide.url) {
            allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: URL is required when title is provided`)
          }
          if (slide.url) {
            if (!validateUrl(slide.url)) {
              allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: Invalid URL format`)
            } else if (!validateGoogleUrl(slide.url)) {
              allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Slide ${si + 1}: Please use a Google service URL (Drive, Docs, Sheets, etc.)`)
            }
          }
        })
        topic.videos.forEach((video, vi) => {
          if (video.title && !video.url) {
            allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Video ${vi + 1}: URL is required when title is provided`)
          }
          if (video.url && !validateUrl(video.url)) {
            allErrors.push(`Course ${ci + 1}, Topic ${ti + 1}, Video ${vi + 1}: Invalid URL`)
          }
        })
      })
    })

    // Validate study tools
    data.courses.forEach((course, ci) => {
      course.studyTools.forEach((tool, ti) => {
        if (!tool.title.trim()) {
          allErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Title is required`)
        }
        if (!tool.type) {
          allErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Type is required`)
        }
        if (tool.content_url && !validateUrl(tool.content_url)) {
          allErrors.push(`Course ${ci + 1}, Study Tool ${ti + 1}: Invalid URL`)
        }
      })
    })

    // If there are validation errors, show them and don't proceed
    if (allErrors.length > 0) {
      toast.error(`Please fix the following errors:\n\n${allErrors.slice(0, 5).join('\n')}${allErrors.length > 5 ? `\n... and ${allErrors.length - 5} more` : ''}`)
      return
    }

    setIsCreating(true)

    try {
      const url = mode === "edit" ? `/api/admin/all-in-one/${editId}` : "/api/admin/all-in-one"
      const method = mode === "edit" ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${mode} content`)
      }

      if (mode === "edit") {
        toast.success(`🎉 Successfully updated "${data.semester.title}"!`)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/admin/all-in-one")
        }
      } else {
        const summary = result.data.summary
        const semesterTitle = data.semester.title

        // Show success message with options
        toast.success(
          `🎉 Successfully created "${semesterTitle}"!\n\n` +
          `📚 Semester: ${semesterTitle}\n` +
          `📖 Courses: ${summary.courses_created}\n` +
          `📝 Topics: ${summary.topics_created}\n` +
          `📊 Slides: ${summary.slides_created}\n` +
          `🎥 Videos: ${summary.videos_created}\n` +
          `📋 Study Tools: ${summary.study_tools_created}`,
          {
            duration: 8000,
            action: {
              label: "View All Semesters",
              onClick: () => router.push("/admin/semesters")
            }
          }
        )

        // Set success state to show success screen
        setCreationSuccess({
          semesterTitle,
          summary
        })

        // Auto-redirect after 5 seconds if user doesn't choose
        setTimeout(() => {
          if (creationSuccess) {
            router.push("/admin/semesters")
          }
        }, 10000)
      }
    } catch (error) {
      console.error(`Error ${mode === "edit" ? "updating" : "creating"} content:`, error)
      toast.error(`Failed to ${mode === "edit" ? "update" : "create"} content. Please try again.`)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading semester data...</p>
        </div>
      </div>
    )
  }

  // Show success screen after creation
  if (creationSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600">
            🎉 Successfully Created!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your semester "{creationSuccess.semesterTitle}" has been created successfully
          </p>
        </div>

        {/* Success Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Creation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-muted-foreground">Semester</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {creationSuccess.summary.courses_created}
                </div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {creationSuccess.summary.topics_created}
                </div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {creationSuccess.summary.slides_created + creationSuccess.summary.videos_created}
                </div>
                <div className="text-sm text-muted-foreground">Materials</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {creationSuccess.summary.study_tools_created}
                </div>
                <div className="text-sm text-muted-foreground">Study Tools</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">What's Next?</CardTitle>
            <CardDescription className="text-center">
              Choose your next action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                onClick={() => {
                  setCreationSuccess(null)
                  setData({
                    semester: {
                      title: "",
                      description: "",
                      section: "",
                      has_midterm: true,
                      has_final: true,
                      start_date: "",
                      end_date: "",
                      credits: 3
                    },
                    courses: []
                  })
                  setCurrentStep(0)
                }}
                variant="outline"
                className="h-20 flex-col"
              >
                <Plus className="h-6 w-6 mb-2" />
                Create Another Semester
              </Button>

              <Button
                onClick={() => router.push("/admin/enhanced-creator/list")}
                className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-6 w-6 mb-2" />
                View All Enhanced Semesters
              </Button>

              <Button
                onClick={() => router.push("/admin/enhanced-creator/edit/" + creationSuccess.semesterTitle)}
                variant="outline"
                className="h-20 flex-col"
              >
                <Edit3 className="h-6 w-6 mb-2" />
                Edit This Semester
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Auto-redirecting to all semesters in 10 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8" />
                {mode === "edit" ? "Edit Semester" : "Enhanced All-in-One Creator"}
              </h1>
              <p className="text-blue-100">
                {mode === "edit"
                  ? "Modify your semester structure with enhanced tools"
                  : "Create complete semester structures with our advanced workflow"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {mode === "edit" && (
                <div className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    className="data-[state=checked]:bg-white/20"
                  />
                  <span>Auto-save</span>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit Mode" : "Preview"}
              </Button>
            </div>
          </div>

          {lastSaved && (
            <div className="mt-4 text-sm text-blue-100">
              <Clock className="h-4 w-4 inline mr-1" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Progress Overview</h3>
              <Badge variant="outline" className="font-mono">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-5 gap-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg border transition-all cursor-pointer ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : index < currentStep
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center justify-center mb-1">
                    {React.createElement(step.icon, { className: "h-4 w-4" })}
                  </div>
                  <div className="text-xs font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors[currentStep] && validationErrors[currentStep].length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors[currentStep].map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card className="min-h-[600px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${steps[currentStep].color} text-white`}>
                {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                <CardDescription className="text-base">
                  {steps[currentStep].description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <ScrollArea className="h-[500px] pr-4">
            {/* Step 0: Semester Setup */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester-title" className="text-sm font-medium">
                        Semester Title *
                      </Label>
                      <Input
                        id="semester-title"
                        placeholder="e.g., Spring 2025"
                        value={data.semester.title}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, title: e.target.value }
                        }))}
                        className={`h-11 ${!data.semester.title.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                      {!data.semester.title.trim() && (
                        <p className="text-sm text-red-600">Semester title is required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester-section" className="text-sm font-medium">
                        Section *
                      </Label>
                      <Input
                        id="semester-section"
                        placeholder="e.g., 63_G"
                        value={data.semester.section}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, section: e.target.value }
                        }))}
                        className={`h-11 ${!data.semester.section.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                      />
                      {!data.semester.section.trim() && (
                        <p className="text-sm text-red-600">Section is required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester-credits" className="text-sm font-medium">
                        Default Credits
                      </Label>
                      <Input
                        id="semester-credits"
                        type="number"
                        min="1"
                        max="6"
                        value={data.semester.credits || 3}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, credits: parseInt(e.target.value) || 3 }
                        }))}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="text-sm font-medium">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={data.semester.start_date || ""}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, start_date: e.target.value }
                        }))}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm font-medium">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={data.semester.end_date || ""}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          semester: { ...prev.semester, end_date: e.target.value }
                        }))}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Midterm Exam</Label>
                          <p className="text-xs text-muted-foreground">Include midterm examination</p>
                        </div>
                        <Switch
                          checked={data.semester.has_midterm}
                          onCheckedChange={(checked) => setData(prev => ({
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
                          checked={data.semester.has_final}
                          onCheckedChange={(checked) => setData(prev => ({
                            ...prev,
                            semester: { ...prev.semester, has_final: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="semester-description"
                    placeholder="Describe this semester, its focus, and any special notes..."
                    value={data.semester.description}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      semester: { ...prev.semester, description: e.target.value }
                    }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Semester Preview */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {data.semester.title || "Not set"}</div>
                    <div><strong>Section:</strong> {data.semester.section || "Not set"}</div>
                    <div><strong>Credits:</strong> {data.semester.credits || 3}</div>
                    <div><strong>Exams:</strong>
                      {data.semester.has_midterm && data.semester.has_final ? " Midterm + Final" :
                       data.semester.has_midterm ? " Midterm only" :
                       data.semester.has_final ? " Final only" : " No exams"}
                    </div>
                    {data.semester.start_date && data.semester.end_date && (
                      <div><strong>Duration:</strong> {data.semester.start_date} to {data.semester.end_date}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Course Management */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Courses ({data.courses.length})
                  </h3>
                  <Button onClick={addCourse} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                {data.courses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No courses added yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first course to the semester
                    </p>
                    <Button onClick={addCourse}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.courses.map((course, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Course {index + 1}</Badge>
                              <h4 className="font-medium">
                                {course.title || `Course ${index + 1}`}
                              </h4>
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
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Credits</Label>
                              <Input
                                type="number"
                                min="1"
                                max="6"
                                value={course.credits || data.semester.credits || 3}
                                onChange={(e) => updateCourse(index, "credits", parseInt(e.target.value) || 3)}
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

                          {/* Course Stats */}
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              {course.topics.length} Topics
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ClipboardList className="h-4 w-4" />
                              {course.studyTools.length} Study Tools
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {course.topics.reduce((sum, topic) => sum + topic.slides.length + topic.videos.length, 0)} Materials
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Course Summary */}
                {data.courses.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Course Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{data.courses.length}</div>
                        <div className="text-muted-foreground">Total Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.courses.reduce((sum, course) => sum + (course.credits || 3), 0)}
                        </div>
                        <div className="text-muted-foreground">Total Credits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.courses.filter(course => course.title && course.course_code && course.teacher_name).length}
                        </div>
                        <div className="text-muted-foreground">Complete</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {data.courses.length - data.courses.filter(course => course.title && course.course_code && course.teacher_name).length}
                        </div>
                        <div className="text-muted-foreground">Incomplete</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Content Creation */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Creation
                  </h3>
                  <Badge variant="outline">
                    {data.courses.reduce((sum, course) => sum + course.topics.length, 0)} Topics Total
                  </Badge>
                </div>

                {data.courses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No courses available</h4>
                    <p className="text-muted-foreground mb-4">
                      Please add courses in the previous step before creating content
                    </p>
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back to Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.courses.map((course, courseIndex) => (
                      <Card key={courseIndex} className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {course.title || `Course ${courseIndex + 1}`}
                              </CardTitle>
                              <CardDescription>
                                {course.course_code} • {course.teacher_name}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {course.topics.length} Topics
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => addTopic(courseIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Topic
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {course.topics.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                              <p className="text-sm text-muted-foreground mb-3">
                                No topics added yet for this course
                              </p>
                              <Button
                                size="sm"
                                onClick={() => addTopic(courseIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Topic
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {course.topics.map((topic, topicIndex) => (
                                <Card key={topicIndex} className="border border-purple-200">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          Topic {topicIndex + 1}
                                        </Badge>
                                        <h5 className="font-medium">
                                          {topic.title || `Topic ${topicIndex + 1}`}
                                        </h5>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTopic(courseIndex, topicIndex)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {/* Topic Details */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Topic Title *</Label>
                                        <Input
                                          placeholder="e.g., Introduction to IoT"
                                          value={topic.title}
                                          onChange={(e) => updateTopic(courseIndex, topicIndex, "title", e.target.value)}
                                          className="h-9"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Order</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={topic.order_index || topicIndex + 1}
                                          onChange={(e) => updateTopic(courseIndex, topicIndex, "order_index", parseInt(e.target.value) || topicIndex + 1)}
                                          className="h-9"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Description</Label>
                                      <Textarea
                                        placeholder="Brief description of this topic..."
                                        value={topic.description}
                                        onChange={(e) => updateTopic(courseIndex, topicIndex, "description", e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                      />
                                    </div>

                                    {/* Slides Section */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                          <Upload className="h-4 w-4" />
                                          Slides ({topic.slides.length})
                                        </Label>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => addSlide(courseIndex, topicIndex)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Slide
                                        </Button>
                                      </div>
                                      {topic.slides.map((slide, slideIndex) => (
                                        <div key={slideIndex} className="flex gap-2 p-3 border rounded-lg bg-muted/30">
                                          <div className="flex-1 grid gap-2 md:grid-cols-2">
                                            <Input
                                              placeholder="Slide title"
                                              value={slide.title}
                                              onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, "title", e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                            <Input
                                              placeholder="Google Drive URL"
                                              value={slide.url}
                                              onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, "url", e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeSlide(courseIndex, topicIndex, slideIndex)}
                                            className="text-destructive hover:text-destructive p-1 h-8 w-8"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Videos Section */}
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                          <Play className="h-4 w-4" />
                                          Videos ({topic.videos.length})
                                        </Label>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => addVideo(courseIndex, topicIndex)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add Video
                                        </Button>
                                      </div>
                                      {topic.videos.map((video, videoIndex) => (
                                        <div key={videoIndex} className="flex gap-2 p-3 border rounded-lg bg-muted/30">
                                          <div className="flex-1 grid gap-2 md:grid-cols-3">
                                            <Input
                                              placeholder="Video title"
                                              value={video.title}
                                              onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, "title", e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                            <Input
                                              placeholder="YouTube URL"
                                              value={video.url}
                                              onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, "url", e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                            <Input
                                              placeholder="Duration (e.g., 15:30)"
                                              value={video.duration || ""}
                                              onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, "duration", e.target.value)}
                                              className="h-8 text-sm"
                                            />
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeVideo(courseIndex, topicIndex, videoIndex)}
                                            className="text-destructive hover:text-destructive p-1 h-8 w-8"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Topic Stats */}
                                    <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Upload className="h-3 w-3" />
                                        {topic.slides.length} Slides
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Play className="h-3 w-3" />
                                        {topic.videos.length} Videos
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Content Summary */}
                {data.courses.some(course => course.topics.length > 0) && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Content Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.courses.reduce((sum, course) => sum + course.topics.length, 0)}
                        </div>
                        <div className="text-muted-foreground">Total Topics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.topics.reduce((topicSum, topic) => topicSum + topic.slides.length, 0), 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Total Slides</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.topics.reduce((topicSum, topic) => topicSum + topic.videos.length, 0), 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Total Videos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.topics.reduce((topicSum, topic) =>
                              topicSum + topic.slides.length + topic.videos.length, 0
                            ), 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Total Materials</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Study Resources */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Study Resources
                  </h3>
                  <Badge variant="outline">
                    {data.courses.reduce((sum, course) => sum + course.studyTools.length, 0)} Resources Total
                  </Badge>
                </div>

                {data.courses.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h4 className="text-lg font-medium mb-2">No courses available</h4>
                    <p className="text-muted-foreground mb-4">
                      Please add courses before creating study resources
                    </p>
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back to Courses
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.courses.map((course, courseIndex) => (
                      <Card key={courseIndex} className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {course.title || `Course ${courseIndex + 1}`}
                              </CardTitle>
                              <CardDescription>
                                {course.course_code} • {course.teacher_name}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {course.studyTools.length} Resources
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => addStudyTool(courseIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Resource
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {course.studyTools.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                              <p className="text-sm text-muted-foreground mb-3">
                                No study resources added yet for this course
                              </p>
                              <Button
                                size="sm"
                                onClick={() => addStudyTool(courseIndex)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Resource
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {course.studyTools.map((tool, toolIndex) => (
                                <Card key={toolIndex} className="border border-orange-200">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          Resource {toolIndex + 1}
                                        </Badge>
                                        <h5 className="font-medium">
                                          {tool.title || `Resource ${toolIndex + 1}`}
                                        </h5>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeStudyTool(courseIndex, toolIndex)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Resource Title *</Label>
                                        <Input
                                          placeholder="e.g., Previous Questions 2023"
                                          value={tool.title}
                                          onChange={(e) => updateStudyTool(courseIndex, toolIndex, "title", e.target.value)}
                                          className="h-9"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Resource Type *</Label>
                                        <select
                                          value={tool.type}
                                          onChange={(e) => updateStudyTool(courseIndex, toolIndex, "type", e.target.value)}
                                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                          <option value="previous_questions">Previous Questions</option>
                                          <option value="exam_note">Exam Notes</option>
                                          <option value="syllabus">Syllabus</option>
                                          <option value="mark_distribution">Mark Distribution</option>
                                        </select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Content URL</Label>
                                        <Input
                                          placeholder="https://drive.google.com/..."
                                          value={tool.content_url}
                                          onChange={(e) => updateStudyTool(courseIndex, toolIndex, "content_url", e.target.value)}
                                          className="h-9"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Exam Type</Label>
                                        <select
                                          value={tool.exam_type}
                                          onChange={(e) => updateStudyTool(courseIndex, toolIndex, "exam_type", e.target.value)}
                                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                          <option value="both">Both Midterm & Final</option>
                                          <option value="midterm">Midterm Only</option>
                                          <option value="final">Final Only</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Description</Label>
                                      <Textarea
                                        placeholder="Brief description of this resource..."
                                        value={tool.description || ""}
                                        onChange={(e) => updateStudyTool(courseIndex, toolIndex, "description", e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                      />
                                    </div>


                                    {/* Resource Preview */}
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                      <div className="flex items-center gap-2 text-sm">
                                        <ClipboardList className="h-4 w-4 text-orange-500" />
                                        <span className="font-medium">
                                          {tool.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                        <Badge variant="outline" className="text-xs">
                                          {tool.exam_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                      </div>
                                      {tool.content_url && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                          <Link className="h-3 w-3 inline mr-1" />
                                          {tool.content_url.length > 50
                                            ? `${tool.content_url.substring(0, 50)}...`
                                            : tool.content_url
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Study Resources Summary */}
                {data.courses.some(course => course.studyTools.length > 0) && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Study Resources Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {data.courses.reduce((sum, course) => sum + course.studyTools.length, 0)}
                        </div>
                        <div className="text-muted-foreground">Total Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.studyTools.filter(tool => tool.type === 'previous_questions').length, 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Previous Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.studyTools.filter(tool => tool.type === 'exam_note').length, 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Exam Notes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {data.courses.reduce((sum, course) =>
                            sum + course.studyTools.filter(tool => tool.exam_type === 'both').length, 0
                          )}
                        </div>
                        <div className="text-muted-foreground">Both Exams</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2">Ready to {mode === "edit" ? "Update" : "Create"}!</h3>
                  <p className="text-muted-foreground">
                    Review your semester structure and {mode === "edit" ? "save changes" : "create everything"}.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold">{data.semester.title || "Untitled"}</div>
                      <div className="text-sm text-muted-foreground">Semester</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold">{data.courses.length}</div>
                      <div className="text-sm text-muted-foreground">Courses</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-2xl font-bold">
                        {data.courses.reduce((sum, course) => sum + course.topics.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Topics</div>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <ClipboardList className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">
                        {data.courses.reduce((sum, course) => sum + course.studyTools.length, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Study Tools</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Final Action */}
                <div className="text-center pt-6">
                  {!isFormReadyForSubmission(data) && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          Please complete the required fields:
                          {!data.semester.title.trim() && " Semester Title"}
                          {!data.semester.section.trim() && " Section"}
                          {data.courses.length === 0 && " At least one Course"}
                          {data.courses.some(c => !c.title.trim() || !c.course_code.trim() || !c.teacher_name.trim()) && " Complete Course Information"}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={handleCreateAll}
                    disabled={isCreating || !isFormReadyForSubmission(data)}
                    size="lg"
                    className="px-8"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {mode === "edit" ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        {mode === "edit" ? "Update Semester" : "Create Everything"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Navigation Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAll}
                  disabled={isCreating || !isFormReadyForSubmission(data)}
                  className="flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === "edit" ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {mode === "edit" ? "Update" : "Create All"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
