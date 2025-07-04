"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, validateTopicTitle, validateSlideTitle, validateVideoTitle } from "@/lib/supabase"
import { validateTopic, validateSlides, validateVideos, formatValidationError, type ValidationError } from "@/lib/validation"
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Search,
  Filter,
  Database,
  Play,
  Presentation,
  ExternalLink,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash,
} from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Topic {
  id: string
  title: string
  description?: string
  section_id: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Section {
  id: string
  name: string
  course_id: string
  section_type: "study-tools" | "topics"
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Course {
  id: string
  code: string
  name: string
  description?: string
  semester_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Slide {
  id: string
  title?: string
  topic_id: string
  slide_url: string
  slide_type: "pdf" | "ppt" | "image"
  order_index: number
  created_at: string
  updated_at: string
}

interface Video {
  id: string
  title?: string
  topic_id: string
  video_url: string
  duration?: string
  thumbnail_url?: string
  video_type: "youtube" | "vimeo" | "direct"
  created_at: string
  updated_at: string
}

interface TopicWithRelations extends Topic {
  section?: Section & {
    course?: Course
  }
  slides?: Slide[]
  videos?: Video[]
}

interface SectionWithCourse extends Section {
  course?: Course
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicWithRelations[]>([])
  const [sections, setSections] = useState<SectionWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<TopicWithRelations | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section_id: "",
    order_index: 0,
    is_active: true,
  })

  const [slides, setSlides] = useState<Partial<Slide>[]>([])
  const [videos, setVideos] = useState<Partial<Video>[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setDbError(null)

      // Check if the topics table exists
      const { error: tableCheckError } = await supabase.from("topics").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes("does not exist")) {
          setDbError("Database tables not found. Please run the setup scripts first.")
          setLoading(false)
          return
        }
        throw tableCheckError
      }

      // Fetch topics with sections and courses separately to avoid relationship issues
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false })

      if (topicsError) throw topicsError

      // Fetch sections with courses
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("section_type", "topics")
        .eq("is_active", true)
        .order("name")

      if (sectionsError) throw sectionsError

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)

      if (coursesError) throw coursesError

      // Fetch slides and videos for topics
      const { data: slidesData, error: slidesError } = await supabase.from("slides").select("*").order("order_index")

      if (slidesError) throw slidesError

      const { data: videosData, error: videosError } = await supabase.from("videos").select("*")

      if (videosError) throw videosError

      // Manually join the data
      const sectionsWithCourses =
        sectionsData?.map((section) => ({
          ...section,
          course: coursesData?.find((course) => course.id === section.course_id),
        })) || []

      const topicsWithRelations =
        topicsData?.map((topic) => ({
          ...topic,
          section: sectionsWithCourses.find((section) => section.id === topic.section_id),
          slides: slidesData?.filter((slide) => slide.topic_id === topic.id) || [],
          videos: videosData?.filter((video) => video.topic_id === topic.id) || [],
        })) || []

      setTopics(topicsWithRelations)
      setSections(sectionsWithCourses)
    } catch (error: any) {
      console.error("Error fetching data:", error)

      let errorMessage = "Failed to fetch data"

      if (error.code === "42P01") {
        errorMessage = "Database tables not found. Please run the setup scripts first."
      } else if (error.code === "42501") {
        errorMessage = "You don't have permission to access this data"
      } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        errorMessage = "Cannot connect to database. Please check your connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      setDbError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = async () => {
    const errors: Record<string, string> = {}

    // Validate topic data
    const topicValidation = await validateTopic(
      {
        title: formData.title,
        description: formData.description,
        section_id: formData.section_id,
        order_index: formData.order_index,
      },
      editingTopic?.id
    )

    // Convert validation errors to the expected format
    topicValidation.errors.forEach((error) => {
      errors[error.field] = formatValidationError(error)
    })

    // Validate slides if we have a topic ID (for existing topics) or if we're creating a new one
    const topicId = editingTopic?.id || "temp"
    if (slides.length > 0) {
      const slidesData = slides.map((slide) => ({
        id: slide.id,
        title: slide.title,
        slide_url: slide.slide_url || "",
        slide_type: slide.slide_type || "pdf",
        topic_id: topicId,
      }))

      const slidesValidation = await validateSlides(slidesData)

      // Convert slide validation errors
      Object.entries(slidesValidation.errors).forEach(([key, slideErrors]) => {
        slideErrors.forEach((error) => {
          errors[`${key}_${error.field}`] = formatValidationError(error)
        })
      })
    }

    // Validate videos if we have a topic ID (for existing topics) or if we're creating a new one
    if (videos.length > 0) {
      const videosData = videos.map((video) => ({
        id: video.id,
        title: video.title,
        video_url: video.video_url || "",
        video_type: video.video_type || "youtube",
        duration: video.duration,
        thumbnail_url: video.thumbnail_url,
        topic_id: topicId,
      }))

      const videosValidation = await validateVideos(videosData)

      // Convert video validation errors
      Object.entries(videosValidation.errors).forEach(([key, videoErrors]) => {
        videoErrors.forEach((error) => {
          errors[`${key}_${error.field}`] = formatValidationError(error)
        })
      })
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) {
      toast.error("Please fix the validation errors")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        section_id: formData.section_id,
        order_index: formData.order_index,
        is_active: formData.is_active,
      }

      let topicId: string

      if (editingTopic) {
        const { error } = await supabase.from("topics").update(submitData).eq("id", editingTopic.id)
        if (error) throw error
        topicId = editingTopic.id
        toast.success("Topic updated successfully")
      } else {
        const { data, error } = await supabase.from("topics").insert([submitData]).select().single()
        if (error) throw error
        topicId = data.id
        toast.success("Topic created successfully")
      }

      // Handle slides
      if (editingTopic) {
        // Delete existing slides
        await supabase.from("slides").delete().eq("topic_id", topicId)
      }

      // Insert new slides
      const validSlides = slides.filter((slide) => slide.slide_url?.trim())
      if (validSlides.length > 0) {
        const slidesToInsert = validSlides.map((slide, index) => ({
          topic_id: topicId,
          title: slide.title?.trim() || null,
          slide_url: slide.slide_url!,
          slide_type: slide.slide_type || "pdf",
          order_index: index + 1,
        }))

        const { error: slidesError } = await supabase.from("slides").insert(slidesToInsert)
        if (slidesError) throw slidesError
      }

      // Handle videos
      if (editingTopic) {
        // Delete existing videos
        await supabase.from("videos").delete().eq("topic_id", topicId)
      }

      // Insert new videos
      const validVideos = videos.filter((video) => video.video_url?.trim())
      if (validVideos.length > 0) {
        const videosToInsert = validVideos.map((video) => ({
          topic_id: topicId,
          title: video.title?.trim() || null,
          video_url: video.video_url!,
          video_type:
            video.video_type ||
            (video.video_url!.includes("youtube")
              ? "youtube"
              : video.video_url!.includes("vimeo")
                ? "vimeo"
                : "direct"),
          duration: video.duration || null,
          thumbnail_url: video.thumbnail_url || null,
        }))

        const { error: videosError } = await supabase.from("videos").insert(videosToInsert)
        if (videosError) throw videosError
      }

      setIsDialogOpen(false)
      setEditingTopic(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving topic:", error)

      // Provide more specific error messages
      let errorMessage = "Failed to save topic"

      if (error.code === "23505") {
        errorMessage = "A topic with this title already exists in this section"
      } else if (error.code === "23503") {
        errorMessage = "Invalid section selected"
      } else if (error.code === "42501") {
        errorMessage = "You don't have permission to perform this action"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (topic: TopicWithRelations) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      description: topic.description || "",
      section_id: topic.section_id,
      order_index: topic.order_index,
      is_active: topic.is_active,
    })

    // Set existing slides and videos
    setSlides(topic.slides || [])
    setVideos(topic.videos || [])

    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure you want to delete this topic? This will also delete all associated slides and videos.")
    ) {
      return
    }

    try {
      // First check if the topic exists and get its details
      const { data: topicData, error: fetchError } = await supabase
        .from("topics")
        .select("title, slides:slides(count), videos:videos(count)")
        .eq("id", id)
        .single()

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          toast.error("Topic not found or already deleted")
          fetchData() // Refresh to update the list
          return
        }
        throw fetchError
      }

      const { error } = await supabase.from("topics").delete().eq("id", id)

      if (error) throw error

      toast.success(`Topic "${topicData.title}" deleted successfully`)
      fetchData()
    } catch (error: any) {
      console.error("Error deleting topic:", error)

      let errorMessage = "Failed to delete topic"

      if (error.code === "42501") {
        errorMessage = "You don't have permission to delete this topic"
      } else if (error.code === "23503") {
        errorMessage = "Cannot delete topic: it may be referenced by other data"
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    }
  }

  const addSlide = () => {
    setSlides([...slides, { title: "", slide_url: "", slide_type: "pdf", order_index: slides.length + 1 }])
  }

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index))
  }

  const updateSlide = (index: number, field: keyof Slide, value: any) => {
    const updatedSlides = [...slides]
    updatedSlides[index] = { ...updatedSlides[index], [field]: value }
    setSlides(updatedSlides)
  }

  const addVideo = () => {
    setVideos([...videos, { title: "", video_url: "", video_type: "youtube" }])
  }

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index))
  }

  const updateVideo = (index: number, field: keyof Video, value: any) => {
    const updatedVideos = [...videos]
    updatedVideos[index] = { ...updatedVideos[index], [field]: value }
    setVideos(updatedVideos)
  }

  // Reordering functions
  const moveSlideUp = (index: number) => {
    if (index > 0) {
      const newSlides = [...slides]
      ;[newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]]
      // Update order_index
      newSlides.forEach((slide, i) => {
        slide.order_index = i + 1
      })
      setSlides(newSlides)
    }
  }

  const moveSlideDown = (index: number) => {
    if (index < slides.length - 1) {
      const newSlides = [...slides]
      ;[newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]]
      // Update order_index
      newSlides.forEach((slide, i) => {
        slide.order_index = i + 1
      })
      setSlides(newSlides)
    }
  }

  const moveVideoUp = (index: number) => {
    if (index > 0) {
      const newVideos = [...videos]
      ;[newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]]
      setVideos(newVideos)
    }
  }

  const moveVideoDown = (index: number) => {
    if (index < videos.length - 1) {
      const newVideos = [...videos]
      ;[newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]]
      setVideos(newVideos)
    }
  }

  const duplicateSlide = (index: number) => {
    const slideToClone = { ...slides[index] }
    delete slideToClone.id // Remove ID so it creates a new one
    slideToClone.title = slideToClone.title ? `${slideToClone.title} (Copy)` : ""
    slideToClone.order_index = slides.length + 1
    setSlides([...slides, slideToClone])
  }

  const duplicateVideo = (index: number) => {
    const videoToClone = { ...videos[index] }
    delete videoToClone.id // Remove ID so it creates a new one
    videoToClone.title = videoToClone.title ? `${videoToClone.title} (Copy)` : ""
    setVideos([...videos, videoToClone])
  }

  // Bulk operations
  const clearAllSlides = () => {
    if (confirm("Are you sure you want to remove all slides?")) {
      setSlides([])
    }
  }

  const clearAllVideos = () => {
    if (confirm("Are you sure you want to remove all videos?")) {
      setVideos([])
    }
  }

  const sortSlidesByTitle = () => {
    const sortedSlides = [...slides].sort((a, b) => {
      const titleA = a.title || a.slide_url || ""
      const titleB = b.title || b.slide_url || ""
      return titleA.localeCompare(titleB)
    })
    // Update order_index
    sortedSlides.forEach((slide, i) => {
      slide.order_index = i + 1
    })
    setSlides(sortedSlides)
  }

  const sortVideosByTitle = () => {
    const sortedVideos = [...videos].sort((a, b) => {
      const titleA = a.title || a.video_url || ""
      const titleB = b.title || b.video_url || ""
      return titleA.localeCompare(titleB)
    })
    setVideos(sortedVideos)
  }

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.section?.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.section?.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      section_id: "",
      order_index: 0,
      is_active: true,
    })
    setSlides([])
    setVideos([])
    setEditingTopic(null)
    setValidationErrors({})
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  // If there's a database error, show setup instructions
  if (dbError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Topics</h1>
            <p className="text-slate-400 mt-2">Manage course topics</p>
          </div>
        </div>

        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{dbError}</AlertDescription>
        </Alert>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Database Setup Required</CardTitle>
            <CardDescription>
              The required database tables don't exist yet. Please run the setup scripts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Please run the database setup scripts shown in the Study Tools section.
            </p>
            <Button onClick={() => fetchData()} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Refresh After Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Topics</h1>
          <p className="text-slate-400 mt-2">Manage course topics with slides and videos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {editingTopic ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingTopic ? "Edit Topic" : "Add New Topic"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm sm:text-base">
                {editingTopic
                  ? "Update topic information, slides, and videos"
                  : "Create a new course topic with content"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="slides">Slides</TabsTrigger>
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="title" className="text-left sm:text-right font-medium">
                      Title *
                    </Label>
                    <div className="col-span-1 sm:col-span-3">
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white h-10 sm:h-9"
                        placeholder="e.g., Information Security Elements"
                        required
                      />
                      {validationErrors.title && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="section_id" className="text-right">
                      Section *
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.section_id}
                        onValueChange={(value) => setFormData({ ...formData, section_id: value })}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={section.id} className="text-white">
                              {section.course?.code} - {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.section_id && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.section_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right mt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3 bg-slate-700 border-slate-600 text-white"
                      placeholder="Topic description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order_index" className="text-right">
                      Order
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="order_index"
                        type="number"
                        value={formData.order_index}
                        onChange={(e) =>
                          setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 0 })
                        }
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="0"
                        min="0"
                      />
                      {validationErrors.order_index && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.order_index}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                      Active
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <span className="text-sm text-slate-400">
                        {formData.is_active ? "Topic is active" : "Topic is inactive"}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="slides" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Slides</h3>
                    <div className="flex items-center gap-2">
                      {slides.length > 0 && (
                        <>
                          <Button
                            type="button"
                            onClick={sortSlidesByTitle}
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                          >
                            Sort A-Z
                          </Button>
                          <Button
                            type="button"
                            onClick={clearAllSlides}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </>
                      )}
                      <Button type="button" onClick={addSlide} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Slide
                      </Button>
                    </div>
                  </div>

                  {slides.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Presentation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No slides added yet</p>
                      <p className="text-sm">Click "Add Slide" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {slides.map((slide, index) => (
                        <Card key={index} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    onClick={() => moveSlideUp(index)}
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === 0}
                                    className="text-slate-400 hover:text-white hover:bg-slate-600 p-1 h-6 w-6"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => moveSlideDown(index)}
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === slides.length - 1}
                                    className="text-slate-400 hover:text-white hover:bg-slate-600 p-1 h-6 w-6"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex-1">
                                  <Label className="text-sm">Title (optional)</Label>
                                  <Input
                                    value={slide.title || ""}
                                    onChange={(e) => updateSlide(index, "title", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="e.g., Introduction Slides"
                                  />
                                  {validationErrors[`slide_${index}_title`] && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors[`slide_${index}_title`]}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    onClick={() => duplicateSlide(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-6 w-6"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => removeSlide(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-6 w-6"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label className="text-sm">URL *</Label>
                                    {slide.slide_url && isValidUrl(slide.slide_url) && (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                  <Input
                                    value={slide.slide_url || ""}
                                    onChange={(e) => updateSlide(index, "slide_url", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="https://example.com/slide.pdf"
                                  />
                                  {validationErrors[`slide_${index}_url`] && (
                                    <p className="text-red-400 text-sm flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors[`slide_${index}_url`]}
                                    </p>
                                  )}
                                </div>
                                <div className="w-32">
                                  <Label className="text-sm">Type</Label>
                                  <Select
                                    value={slide.slide_type || "pdf"}
                                    onValueChange={(value) => updateSlide(index, "slide_type", value)}
                                  >
                                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="pdf">PDF</SelectItem>
                                      <SelectItem value="ppt">PowerPoint</SelectItem>
                                      <SelectItem value="image">Image</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            {slide.slide_url && isValidUrl(slide.slide_url) && (
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-400 hover:text-blue-300"
                                  onClick={() => window.open(slide.slide_url, "_blank")}
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="videos" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Videos</h3>
                    <div className="flex items-center gap-2">
                      {videos.length > 0 && (
                        <>
                          <Button
                            type="button"
                            onClick={sortVideosByTitle}
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-slate-300"
                          >
                            Sort A-Z
                          </Button>
                          <Button
                            type="button"
                            onClick={clearAllVideos}
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </>
                      )}
                      <Button type="button" onClick={addVideo} size="sm" className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                    </div>
                  </div>

                  {videos.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No videos added yet</p>
                      <p className="text-sm">Click "Add Video" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {videos.map((video, index) => (
                        <Card key={index} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    onClick={() => moveVideoUp(index)}
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === 0}
                                    className="text-slate-400 hover:text-white hover:bg-slate-600 p-1 h-6 w-6"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => moveVideoDown(index)}
                                    size="sm"
                                    variant="ghost"
                                    disabled={index === videos.length - 1}
                                    className="text-slate-400 hover:text-white hover:bg-slate-600 p-1 h-6 w-6"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex-1">
                                  <Label className="text-sm">Title (optional)</Label>
                                  <Input
                                    value={video.title || ""}
                                    onChange={(e) => updateVideo(index, "title", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="e.g., Introduction Video"
                                  />
                                  {validationErrors[`video_${index}_title`] && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors[`video_${index}_title`]}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    onClick={() => duplicateVideo(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-6 w-6"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => removeVideo(index)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-6 w-6"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Label className="text-sm">Video URL *</Label>
                                    {video.video_url && isValidUrl(video.video_url) && (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                  <Input
                                    value={video.video_url || ""}
                                    onChange={(e) => updateVideo(index, "video_url", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                  />
                                  {validationErrors[`video_${index}_url`] && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      {validationErrors[`video_${index}_url`]}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm">Type</Label>
                                  <Select
                                    value={video.video_type || "youtube"}
                                    onValueChange={(value) => updateVideo(index, "video_type", value)}
                                  >
                                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="youtube">YouTube</SelectItem>
                                      <SelectItem value="vimeo">Vimeo</SelectItem>
                                      <SelectItem value="direct">Direct Link</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm">Duration</Label>
                                  <Input
                                    value={video.duration || ""}
                                    onChange={(e) => updateVideo(index, "duration", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white"
                                    placeholder="e.g., 15:30"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Thumbnail URL (optional)</Label>
                                <Input
                                  value={video.thumbnail_url || ""}
                                  onChange={(e) => updateVideo(index, "thumbnail_url", e.target.value)}
                                  className="bg-slate-600 border-slate-500 text-white"
                                  placeholder="https://example.com/thumbnail.jpg"
                                />
                              </div>

                              {video.video_url && isValidUrl(video.video_url) && (
                                <div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-400 hover:text-blue-300"
                                    onClick={() => window.open(video.video_url, "_blank")}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Preview Video
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingTopic ? "Update Topic" : "Create Topic"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Topics</CardTitle>
          <CardDescription>
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading topics...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Section</TableHead>
                  <TableHead className="text-slate-300">Content</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Order</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">
                      <div>
                        <p className="font-medium">{topic.title}</p>
                        {topic.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{topic.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="font-medium">{topic.section?.course?.code || "N/A"}</p>
                        <p className="text-sm text-slate-500">{topic.section?.course?.name || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{topic.section?.name || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {topic.slides && topic.slides.length > 0 && (
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                            <Presentation className="w-3 h-3 mr-1" />
                            {topic.slides.length} Slide{topic.slides.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {topic.videos && topic.videos.length > 0 && (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            <Play className="w-3 h-3 mr-1" />
                            {topic.videos.length} Video{topic.videos.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={topic.is_active ? "default" : "secondary"}
                        className={
                          topic.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {topic.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{topic.order_index}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(topic)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredTopics.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No topics found</p>
              <p className="text-slate-500 text-sm">Create your first topic to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
