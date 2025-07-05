"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, FileText, Video, Upload } from "lucide-react"
import { ContentList } from "@/components/admin/content-list"
import { CreateContentDialog } from "@/components/admin/create-content-dialog"
import { EditContentDialog } from "@/components/admin/edit-content-dialog"
import { BulkUploadDialog } from "@/components/admin/bulk-upload-dialog"

interface Slide {
  id: number
  topic_id: number
  title: string
  url: string
  order_index: number
  topic: {
    title: string
    course: {
      title: string
      semester: {
        name: string
      }
    }
  }
}

interface Content {
  id: number
  topic_id: number
  title: string
  url: string
  order_index: number
  topic: {
    title: string
    course: {
      title: string
      semester: {
        name: string
      }
    }
  }
}

export default function ContentPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [videos, setVideos] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [contentType, setContentType] = useState<"slide" | "video">("slide")
  const [editingContent, setEditingContent] = useState<Slide | Content | null>(null)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const [slidesRes, videosRes] = await Promise.all([
        fetch("/api/admin/content/slides"),
        fetch("/api/admin/content/videos"),
      ])

      const read = async (res: Response) => {
        if (!res.ok) {
          // read text so we don’t attempt JSON on plain-text bodies
          const msg = await res.text()
          throw new Error(msg || `Request failed (${res.status})`)
        }
        return res.json()
      }

      const [slidesData, videosData] = await Promise.all([read(slidesRes), read(videosRes)])

      setSlides(slidesData)
      setVideos(videosData)
    } catch (err) {
      console.error("Error fetching content:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContent = () => {
    fetchContent()
    setCreateDialogOpen(false)
  }

  const handleEditContent = (content: Slide | Content, type: "slide" | "video") => {
    setEditingContent(content)
    setContentType(type)
    setEditDialogOpen(true)
  }

  const handleUpdateContent = () => {
    fetchContent()
    setEditDialogOpen(false)
    setEditingContent(null)
  }

  const handleDeleteContent = async (id: number, type: "slide" | "video") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const response = await fetch(`/api/admin/content/${type}s/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchContent()
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  const filteredSlides = slides.filter(
    (slide) =>
      slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.topic.course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.topic.course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage slides and videos across all courses</p>
        </div>
        <div className="flex gap-2">
          <CreateContentDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            type={contentType}
            onSuccess={handleCreateContent}
          />
          <BulkUploadDialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen} onSuccess={handleCreateContent} />
          <Button
            onClick={() => {
              setContentType("slide")
              setCreateDialogOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>
          <Button
            onClick={() => {
              setContentType("video")
              setCreateDialogOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
          <Button onClick={() => setBulkUploadOpen(true)} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            <FileText className="h-3 w-3" />
            {slides.length} Slides
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Video className="h-3 w-3" />
            {videos.length} Videos
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="slides" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slides" className="gap-2">
            <FileText className="h-4 w-4" />
            Slides ({filteredSlides.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Videos ({filteredVideos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides">
          <ContentList
            content={filteredSlides}
            type="slide"
            loading={loading}
            onEdit={(content) => handleEditContent(content, "slide")}
            onDelete={(id) => handleDeleteContent(id, "slide")}
          />
        </TabsContent>

        <TabsContent value="videos">
          <ContentList
            content={filteredVideos}
            type="video"
            loading={loading}
            onEdit={(content) => handleEditContent(content, "video")}
            onDelete={(id) => handleDeleteContent(id, "video")}
          />
        </TabsContent>
      </Tabs>

      <CreateContentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        type={contentType}
        onSuccess={handleCreateContent}
      />

      <EditContentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        content={editingContent}
        type={contentType}
        onSuccess={handleUpdateContent}
      />
    </div>
  )
}
