"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Calendar,
  BookOpen,
  FileText,
  Play,
  Video,
  Presentation,
  ClipboardList,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SemesterData {
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
}

interface CourseData {
  title: string
  course_code: string
  teacher_name: string
}

interface TopicData {
  title: string
  description: string
  slides: { title: string; url: string }[]
  videos: { title: string; url: string }[]
}

interface StudyToolData {
  title: string
  type: string
  content_url: string
  exam_type: string
}

interface AllInOneData {
  semester: SemesterData
  courses: (CourseData & {
    id?: string
    topics: TopicData[]
    studyTools: StudyToolData[]
  })[]
}

interface AllInOneCreatorProps {
  editId?: string
  mode?: "create" | "edit"
  onSuccess?: () => void
}

const STUDY_TOOL_TYPES = [
  { value: "previous_questions", label: "Previous Questions" },
  { value: "exam_note", label: "Exam Notes" },
  { value: "syllabus", label: "Syllabus" },
  { value: "mark_distribution", label: "Mark Distribution" }
]

const EXAM_TYPES = [
  { value: "both", label: "Both Exams" },
  { value: "midterm", label: "Midterm Only" },
  { value: "final", label: "Final Only" }
]

export function AllInOneCreator({ editId, mode = "create", onSuccess }: AllInOneCreatorProps = {}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<AllInOneData>({
    semester: {
      title: "",
      description: "",
      section: "",
      has_midterm: true,
      has_final: true
    },
    courses: []
  })

  const steps = [
    { title: "Semester", icon: Calendar, description: mode === "edit" ? "Edit semester information" : "Create semester information" },
    { title: "Courses", icon: BookOpen, description: mode === "edit" ? "Edit courses in the semester" : "Add courses to the semester" },
    { title: "Topics & Content", icon: FileText, description: mode === "edit" ? "Edit topics and content for each course" : "Add topics and content for each course" },
    { title: "Study Tools", icon: ClipboardList, description: mode === "edit" ? "Edit study materials and resources" : "Add study materials and resources" },
    { title: "Review", icon: Check, description: mode === "edit" ? "Review and update everything" : "Review and create everything" }
  ]

  // Load existing data when in edit mode
  useEffect(() => {
    if (mode === "edit" && editId) {
      loadExistingData()
    }
  }, [mode, editId])

  const loadExistingData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/all-in-one/${editId}`)
      if (!response.ok) {
        throw new Error("Failed to load semester data")
      }

      const existingData = await response.json()
      setData(existingData)
    } catch (error) {
      console.error("Error loading existing data:", error)
      alert("Failed to load semester data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addCourse = () => {
    setData(prev => ({
      ...prev,
      courses: [
        ...prev.courses,
        {
          title: "",
          course_code: "",
          teacher_name: "",
          topics: [],
          studyTools: []
        }
      ]
    }))
  }

  const removeCourse = (courseIndex: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, index) => index !== courseIndex)
    }))
  }

  const updateCourse = (courseIndex: number, field: keyof CourseData, value: string) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) => 
        index === courseIndex ? { ...course, [field]: value } : course
      )
    }))
  }

  const addTopic = (courseIndex: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              topics: [
                ...course.topics,
                {
                  title: "",
                  description: "",
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
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              topics: course.topics.filter((_, tIndex) => tIndex !== topicIndex)
            }
          : course
      )
    }))
  }

  const updateTopic = (courseIndex: number, topicIndex: number, field: keyof TopicData, value: any) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              topics: course.topics.map((topic, tIndex) => 
                tIndex === topicIndex ? { ...topic, [field]: value } : topic
              )
            }
          : course
      )
    }))
  }

  const addSlide = (courseIndex: number, topicIndex: number) => {
    const newSlides = [...data.courses[courseIndex].topics[topicIndex].slides, { title: "", url: "" }]
    updateTopic(courseIndex, topicIndex, "slides", newSlides)
  }

  const addVideo = (courseIndex: number, topicIndex: number) => {
    const newVideos = [...data.courses[courseIndex].topics[topicIndex].videos, { title: "", url: "" }]
    updateTopic(courseIndex, topicIndex, "videos", newVideos)
  }

  const removeSlide = (courseIndex: number, topicIndex: number, slideIndex: number) => {
    const newSlides = data.courses[courseIndex].topics[topicIndex].slides.filter((_, sIndex) => sIndex !== slideIndex)
    updateTopic(courseIndex, topicIndex, "slides", newSlides)
  }

  const removeVideo = (courseIndex: number, topicIndex: number, videoIndex: number) => {
    const newVideos = data.courses[courseIndex].topics[topicIndex].videos.filter((_, vIndex) => vIndex !== videoIndex)
    updateTopic(courseIndex, topicIndex, "videos", newVideos)
  }

  const updateSlide = (courseIndex: number, topicIndex: number, slideIndex: number, field: "title" | "url", value: string) => {
    const newSlides = data.courses[courseIndex].topics[topicIndex].slides.map((slide, sIndex) => 
      sIndex === slideIndex ? { ...slide, [field]: value } : slide
    )
    updateTopic(courseIndex, topicIndex, "slides", newSlides)
  }

  const updateVideo = (courseIndex: number, topicIndex: number, videoIndex: number, field: "title" | "url", value: string) => {
    const newVideos = data.courses[courseIndex].topics[topicIndex].videos.map((video, vIndex) => 
      vIndex === videoIndex ? { ...video, [field]: value } : video
    )
    updateTopic(courseIndex, topicIndex, "videos", newVideos)
  }

  // Study Tools functions
  const addStudyTool = (courseIndex: number) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              studyTools: [
                ...course.studyTools,
                {
                  title: "",
                  type: "",
                  content_url: "",
                  exam_type: "both"
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
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              studyTools: course.studyTools.filter((_, tIndex) => tIndex !== toolIndex)
            }
          : course
      )
    }))
  }

  const updateStudyTool = (courseIndex: number, toolIndex: number, field: keyof StudyToolData, value: string) => {
    setData(prev => ({
      ...prev,
      courses: prev.courses.map((course, index) => 
        index === courseIndex 
          ? {
              ...course,
              studyTools: course.studyTools.map((tool, tIndex) => 
                tIndex === toolIndex ? { ...tool, [field]: value } : tool
              )
            }
          : course
      )
    }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Semester step
        return data.semester.title.trim() !== "" && data.semester.section.trim() !== ""
      case 1: // Courses step
        return data.courses.length > 0 && data.courses.every(course => 
          course.title.trim() !== "" && course.course_code.trim() !== "" && course.teacher_name.trim() !== ""
        )
      case 2: // Topics & Content step
        return data.courses.every(course => course.topics.length > 0 && 
          course.topics.every(topic => topic.title.trim() !== "")
        )
      case 3: // Study Tools step
        return true // Optional step
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateAll = async () => {
    setIsCreating(true)

    try {
      const response = await fetch("/api/admin/all-in-one", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create content")
      }

      // Success! Show detailed success message
      const summary = result.data.summary
      alert(
        `🎉 Successfully created everything!\n\n` +
        `📚 Semester: ${data.semester.title}\n` +
        `📖 Courses: ${summary.courses_created}\n` +
        `📝 Topics: ${summary.topics_created}\n` +
        `📊 Slides: ${summary.slides_created}\n` +
        `🎥 Videos: ${summary.videos_created}\n` +
        `📋 Study Tools: ${summary.study_tools_created}`
      )

      // Reset the form
      setData({
        semester: {
          title: "",
          description: "",
          section: "",
          has_midterm: true,
          has_final: true
        },
        courses: []
      })
      setCurrentStep(0)

      // Refresh the page to update any cached data
      router.refresh()

    } catch (error) {
      console.error("Error creating content:", error)
      alert(`❌ Error creating content: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          
          return (
            <div key={index} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive ? 'bg-primary text-primary-foreground' : 
                isCompleted ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Semester */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="semester-title">Semester Title *</Label>
                  <Input
                    id="semester-title"
                    placeholder="e.g., Spring 2025"
                    value={data.semester.title}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      semester: { ...prev.semester, title: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester-section">Section *</Label>
                  <Input
                    id="semester-section"
                    placeholder="e.g., 63_G"
                    value={data.semester.section}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      semester: { ...prev.semester, section: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester-description">Description</Label>
                <Textarea
                  id="semester-description"
                  placeholder="Brief description of the semester"
                  value={data.semester.description}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    semester: { ...prev.semester, description: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-3">
                <Label>Exam Types</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-midterm"
                      checked={data.semester.has_midterm}
                      onCheckedChange={(checked) => setData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, has_midterm: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="has-midterm">Has Midterm Exam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-final"
                      checked={data.semester.has_final}
                      onCheckedChange={(checked) => setData(prev => ({
                        ...prev,
                        semester: { ...prev.semester, has_final: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="has-final">Has Final Exam</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Courses */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Courses for {data.semester.title}</h3>
                <Button onClick={addCourse} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>

              {data.courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses added yet. Click "Add Course" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.courses.map((course, courseIndex) => (
                    <Card key={courseIndex} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Course {courseIndex + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCourse(courseIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Course Title *</Label>
                            <Input
                              placeholder="e.g., Internet of Things"
                              value={course.title}
                              onChange={(e) => updateCourse(courseIndex, "title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Course Code *</Label>
                            <Input
                              placeholder="e.g., CSE 422"
                              value={course.course_code}
                              onChange={(e) => updateCourse(courseIndex, "course_code", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Teacher Name *</Label>
                          <Input
                            placeholder="e.g., Dr. Ahmed Rahman"
                            value={course.teacher_name}
                            onChange={(e) => updateCourse(courseIndex, "teacher_name", e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Topics & Content */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Topics & Content</h3>

              {data.courses.map((course, courseIndex) => (
                <Card key={courseIndex} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{course.title || `Course ${courseIndex + 1}`}</CardTitle>
                      <Button onClick={() => addTopic(courseIndex)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Topic
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.topics.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No topics added yet.</p>
                      </div>
                    ) : (
                      course.topics.map((topic, topicIndex) => (
                        <Card key={topicIndex} className="bg-muted/30">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">Topic {topicIndex + 1}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTopic(courseIndex, topicIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Topic Title *</Label>
                                <Input
                                  placeholder="e.g., Introduction to IoT"
                                  value={topic.title}
                                  onChange={(e) => updateTopic(courseIndex, topicIndex, "title", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                  placeholder="Brief description"
                                  value={topic.description}
                                  onChange={(e) => updateTopic(courseIndex, topicIndex, "description", e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Slides Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Presentation className="h-4 w-4" />
                                  Slides
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSlide(courseIndex, topicIndex)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Slide
                                </Button>
                              </div>
                              {topic.slides.map((slide, slideIndex) => (
                                <div key={slideIndex} className="flex gap-2 items-end">
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      placeholder="Slide title"
                                      value={slide.title}
                                      onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, "title", e.target.value)}
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      placeholder="Google Drive URL"
                                      value={slide.url}
                                      onChange={(e) => updateSlide(courseIndex, topicIndex, slideIndex, "url", e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSlide(courseIndex, topicIndex, slideIndex)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {/* Videos Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Videos
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addVideo(courseIndex, topicIndex)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Video
                                </Button>
                              </div>
                              {topic.videos.map((video, videoIndex) => (
                                <div key={videoIndex} className="flex gap-2 items-end">
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      placeholder="Video title"
                                      value={video.title}
                                      onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, "title", e.target.value)}
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <Input
                                      placeholder="YouTube URL"
                                      value={video.url}
                                      onChange={(e) => updateVideo(courseIndex, topicIndex, videoIndex, "url", e.target.value)}
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVideo(courseIndex, topicIndex, videoIndex)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Study Tools */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Study Tools & Resources</h3>

              {data.courses.map((course, courseIndex) => (
                <Card key={courseIndex} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{course.title || `Course ${courseIndex + 1}`}</CardTitle>
                      <Button onClick={() => addStudyTool(courseIndex)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Study Tool
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.studyTools.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No study tools added yet.</p>
                      </div>
                    ) : (
                      course.studyTools.map((tool, toolIndex) => (
                        <Card key={toolIndex} className="bg-muted/30">
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Study Tool {toolIndex + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudyTool(courseIndex, toolIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  placeholder="e.g., Midterm Previous Questions 2024"
                                  value={tool.title}
                                  onChange={(e) => updateStudyTool(courseIndex, toolIndex, "title", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                  value={tool.type}
                                  onValueChange={(value) => updateStudyTool(courseIndex, toolIndex, "type", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STUDY_TOOL_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Content URL</Label>
                                <Input
                                  placeholder="https://drive.google.com/file/..."
                                  value={tool.content_url}
                                  onChange={(e) => updateStudyTool(courseIndex, toolIndex, "content_url", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Exam Type</Label>
                                <Select
                                  value={tool.exam_type}
                                  onValueChange={(value) => updateStudyTool(courseIndex, toolIndex, "exam_type", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EXAM_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review & Create</h3>

              {/* Semester Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Semester: {data.semester.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div><strong>Section:</strong> {data.semester.section}</div>
                    {data.semester.description && <div><strong>Description:</strong> {data.semester.description}</div>}
                    <div className="flex gap-4">
                      <Badge variant={data.semester.has_midterm ? "default" : "secondary"}>
                        {data.semester.has_midterm ? "Has Midterm" : "No Midterm"}
                      </Badge>
                      <Badge variant={data.semester.has_final ? "default" : "secondary"}>
                        {data.semester.has_final ? "Has Final" : "No Final"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Courses Summary */}
              <div className="space-y-4">
                <h4 className="font-medium">Courses ({data.courses.length})</h4>
                {data.courses.map((course, courseIndex) => (
                  <Card key={courseIndex}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {course.title} ({course.course_code})
                      </CardTitle>
                      <CardDescription>Teacher: {course.teacher_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Topics ({course.topics.length})
                          </h5>
                          {course.topics.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {course.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="flex items-center gap-2">
                                  <span>• {topic.title}</span>
                                  <div className="flex gap-1">
                                    {topic.slides.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {topic.slides.length} slides
                                      </Badge>
                                    )}
                                    {topic.videos.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {topic.videos.length} videos
                                      </Badge>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No topics</p>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <ClipboardList className="h-3 w-3" />
                            Study Tools ({course.studyTools.length})
                          </h5>
                          {course.studyTools.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {course.studyTools.map((tool, toolIndex) => (
                                <li key={toolIndex} className="flex items-center gap-2">
                                  <span>• {tool.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {STUDY_TOOL_TYPES.find(t => t.value === tool.type)?.label}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No study tools</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAll}
                  disabled={isCreating || !canProceedToNext()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Everything
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
