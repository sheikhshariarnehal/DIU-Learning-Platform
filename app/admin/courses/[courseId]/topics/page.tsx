"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  ArrowLeft,
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

interface TopicWithContent extends Topic {
  slides?: Slide[]
  videos?: Video[]
}

export default function CourseTopicsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [topicsSection, setTopicsSection] = useState<Section | null>(null)
  const [topics, setTopics] = useState<TopicWithContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<TopicWithContent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 0,
    is_active: true,
  })

  const [slides, setSlides] = useState<Partial<Slide>[]>([])
  const [videos, setVideos] = useState<Partial<Video>[]>([])

  useEffect(() => {
    if (courseId) {
      fetchData()
    }
  }, [courseId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setDbError(null)

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Find or create topics section for this course
      let { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId)
        .eq("section_type", "topics")
        .eq("is_active", true)

      if (sectionsError) throw sectionsError

      let topicsSection = sectionsData?.[0]

      // Create topics section if it doesn't exist
      if (!topicsSection) {
        const { data: newSection, error: createError } = await supabase
          .from("sections")
          .insert([
            {
              name: "Topics",
              course_id: courseId,
              section_type: "topics",
              order_index: 2,
              is_active: true,
            },
          ])
          .select()
          .single()

        if (createError) throw createError
        topicsSection = newSection
      }

      setTopicsSection(topicsSection)

      // Fetch topics for this section
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("section_id", topicsSection.id)
        .order("order_index")

      if (topicsError) throw topicsError

      // Fetch slides and videos for all topics
      const topicIds = topicsData?.map((t) => t.id) || []
      
      const [slidesResult, videosResult] = await Promise.all([
        supabase.from("slides").select("*").in("topic_id", topicIds).order("order_index"),
        supabase.from("videos").select("*").in("topic_id", topicIds),
      ])

      if (slidesResult.error) throw slidesResult.error
      if (videosResult.error) throw videosResult.error

      // Combine topics with their content
      const topicsWithContent = topicsData?.map((topic) => ({
        ...topic,
        slides: slidesResult.data?.filter((slide) => slide.topic_id === topic.id) || [],
        videos: videosResult.data?.filter((video) => video.topic_id === topic.id) || [],
      })) || []

      setTopics(topicsWithContent)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error(`Failed to fetch data: ${error.message}`)
      setDbError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = async () => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = "Title is required"
    } else if (formData.title.length < 3) {
      errors.title = "Title must be at least 3 characters"
    } else if (topicsSection) {
      // Check for unique title within the section
      try {
        const isUnique = await validateTopicTitle(
          formData.title,
          topicsSection.id,
          editingTopic?.id
        )
        if (!isUnique) {
          errors.title = "A topic with this title already exists in this course"
        }
      } catch (error) {
        console.error("Error checking topic title uniqueness:", error)
        errors.title = "Error validating title uniqueness"
      }
    }

    if (formData.order_index < 0) {
      errors.order_index = "Order must be a positive number"
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

    if (!topicsSection) {
      toast.error("Topics section not found")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        section_id: topicsSection.id,
        order_index: formData.order_index || topics.length + 1,
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
      toast.error(error.message || "Failed to save topic")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (topic: TopicWithContent) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      description: topic.description || "",
      order_index: topic.order_index,
      is_active: topic.is_active,
    })

    setSlides(topic.slides || [])
    setVideos(topic.videos || [])
    setIsDialogOpen(true)
  }

  // Slide management functions
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

  // Video management functions
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic? This will also delete all associated slides and videos.")) {
      return
    }

    try {
      const { error } = await supabase.from("topics").delete().eq("id", id)

      if (error) throw error
      toast.success("Topic deleted successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting topic:", error)
      toast.error(error.message || "Failed to delete topic")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
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

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading course topics...</p>
        </div>
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Course Topics</h1>
            <p className="text-slate-400 mt-2">Error loading course topics</p>
          </div>
        </div>

        <Alert variant="destructive">
          <Database className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{dbError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Topics</h1>
            <p className="text-slate-400 mt-2">
              {course?.code} - {course?.name}
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingTopic ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingTopic ? "Edit Topic" : "Add New Topic"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingTopic
                  ? "Update topic information for this course"
                  : "Create a new topic for this course"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
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

              {/* Slides and Videos Tabs */}
              <div className="mt-6">
                <Tabs defaultValue="slides" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                    <TabsTrigger value="slides" className="data-[state=active]:bg-slate-600">
                      <Presentation className="w-4 h-4 mr-2" />
                      Slides ({slides.length})
                    </TabsTrigger>
                    <TabsTrigger value="videos" className="data-[state=active]:bg-slate-600">
                      <Play className="w-4 h-4 mr-2" />
                      Videos ({videos.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="slides" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-300">Slides</h4>
                      <Button
                        type="button"
                        onClick={addSlide}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Slide
                      </Button>
                    </div>

                    {slides.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Presentation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No slides added yet</p>
                        <p className="text-sm">Click "Add Slide" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {slides.map((slide, index) => (
                          <div key={index} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-xs text-slate-400">Title (optional)</Label>
                                  <Input
                                    value={slide.title || ""}
                                    onChange={(e) => updateSlide(index, "title", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white text-sm"
                                    placeholder="e.g., Introduction Slides"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-400">Slide URL *</Label>
                                  <Input
                                    value={slide.slide_url || ""}
                                    onChange={(e) => updateSlide(index, "slide_url", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white text-sm"
                                    placeholder="https://drive.google.com/..."
                                    required
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-400">Type</Label>
                                  <Select
                                    value={slide.slide_type || "pdf"}
                                    onValueChange={(value) => updateSlide(index, "slide_type", value)}
                                  >
                                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600">
                                      <SelectItem value="pdf">PDF</SelectItem>
                                      <SelectItem value="ppt">PowerPoint</SelectItem>
                                      <SelectItem value="image">Image</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeSlide(index)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                              >
                                <Trash className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="videos" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-300">Videos</h4>
                      <Button
                        type="button"
                        onClick={addVideo}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Video
                      </Button>
                    </div>

                    {videos.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No videos added yet</p>
                        <p className="text-sm">Click "Add Video" to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {videos.map((video, index) => (
                          <div key={index} className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 space-y-2">
                                <div>
                                  <Label className="text-xs text-slate-400">Title (optional)</Label>
                                  <Input
                                    value={video.title || ""}
                                    onChange={(e) => updateVideo(index, "title", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white text-sm"
                                    placeholder="e.g., Introduction Video"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-slate-400">Video URL *</Label>
                                  <Input
                                    value={video.video_url || ""}
                                    onChange={(e) => updateVideo(index, "video_url", e.target.value)}
                                    className="bg-slate-600 border-slate-500 text-white text-sm"
                                    placeholder="https://youtube.com/watch?v=..."
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-slate-400">Type</Label>
                                    <Select
                                      value={video.video_type || "youtube"}
                                      onValueChange={(value) => updateVideo(index, "video_type", value)}
                                    >
                                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-700 border-slate-600">
                                        <SelectItem value="youtube">YouTube</SelectItem>
                                        <SelectItem value="vimeo">Vimeo</SelectItem>
                                        <SelectItem value="direct">Direct Link</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-slate-400">Duration</Label>
                                    <Input
                                      value={video.duration || ""}
                                      onChange={(e) => updateVideo(index, "duration", e.target.value)}
                                      className="bg-slate-600 border-slate-500 text-white text-sm"
                                      placeholder="e.g., 10:30"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeVideo(index)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                              >
                                <Trash className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
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

      {/* Search */}
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
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Course Topics</CardTitle>
          <CardDescription>
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No topics found for this course</p>
              <p className="text-slate-500 text-sm">Create your first topic to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Order</TableHead>
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Content</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((topic) => (
                  <TableRow key={topic.id} className="border-slate-700">
                    <TableCell className="text-slate-300 font-mono">{topic.order_index}</TableCell>
                    <TableCell className="text-white font-medium">
                      <div>
                        <p className="font-medium">{topic.title}</p>
                        {topic.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{topic.description}</p>
                        )}
                      </div>
                    </TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
