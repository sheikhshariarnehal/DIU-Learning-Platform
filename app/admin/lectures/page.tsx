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
import { supabase, type Lecture } from "@/lib/supabase"
import { Plus, Edit, Trash2, Video, Search, Filter, Database, Play, Clock } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

interface LectureWithRelations extends Lecture {
  section?: Section & {
    course?: Course
  }
}

interface SectionWithCourse extends Section {
  course?: Course
}

export default function LecturesPage() {
  const [lectures, setLectures] = useState<LectureWithRelations[]>([])
  const [sections, setSections] = useState<SectionWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    video_url: "",
    section_id: "",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setDbError(null)

      // Check if the lectures table exists
      const { error: tableCheckError } = await supabase.from("lectures").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes("does not exist")) {
          setDbError("Database tables not found. Please run the setup scripts first.")
          setLoading(false)
          return
        }
        throw tableCheckError
      }

      // Fetch lectures without joins first
      const { data: lecturesData, error: lecturesError } = await supabase
        .from("lectures")
        .select("*")
        .order("created_at", { ascending: false })

      if (lecturesError) throw lecturesError

      // Fetch sections separately
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (sectionsError) throw sectionsError

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)

      if (coursesError) throw coursesError

      // Manually join the data
      const sectionsWithCourses =
        sectionsData?.map((section) => ({
          ...section,
          course: coursesData?.find((course) => course.id === section.course_id),
        })) || []

      const lecturesWithRelations =
        lecturesData?.map((lecture) => ({
          ...lecture,
          section: sectionsWithCourses.find((section) => section.id === lecture.section_id),
        })) || []

      setLectures(lecturesWithRelations)
      setSections(sectionsWithCourses)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error(`Failed to fetch data: ${error.message}`)
      setDbError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.section_id) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        duration: formData.duration.trim() || null,
        video_url: formData.video_url.trim() || null,
        section_id: formData.section_id,
        order_index: formData.order_index,
        is_active: formData.is_active,
      }

      if (editingLecture) {
        const { error } = await supabase.from("lectures").update(submitData).eq("id", editingLecture.id)

        if (error) throw error
        toast.success("Lecture updated successfully")
      } else {
        const { error } = await supabase.from("lectures").insert([submitData])

        if (error) throw error
        toast.success("Lecture created successfully")
      }

      setIsDialogOpen(false)
      setEditingLecture(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving lecture:", error)
      toast.error(error.message || "Failed to save lecture")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (lecture: Lecture) => {
    setEditingLecture(lecture)
    setFormData({
      title: lecture.title,
      description: lecture.description || "",
      duration: lecture.duration || "",
      video_url: lecture.video_url || "",
      section_id: lecture.section_id,
      order_index: lecture.order_index,
      is_active: lecture.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lecture?")) {
      return
    }

    try {
      const { error } = await supabase.from("lectures").delete().eq("id", id)

      if (error) throw error
      toast.success("Lecture deleted successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting lecture:", error)
      toast.error(error.message || "Failed to delete lecture")
    }
  }

  const filteredLectures = lectures.filter(
    (lecture) =>
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.section?.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.section?.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      video_url: "",
      section_id: "",
      order_index: 0,
      is_active: true,
    })
    setEditingLecture(null)
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
            <h1 className="text-3xl font-bold text-white">Lectures</h1>
            <p className="text-slate-400 mt-2">Manage course lectures</p>
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
              Please run the database setup script: scripts/03-create-lectures-table.sql
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
          <h1 className="text-3xl font-bold text-white">Lectures</h1>
          <p className="text-slate-400 mt-2">Manage course lectures and video content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLecture ? "Edit Lecture" : "Add New Lecture"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingLecture ? "Update lecture information" : "Create a new course lecture"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Introduction to Security"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section_id" className="text-right">
                    Section *
                  </Label>
                  <Select
                    value={formData.section_id}
                    onValueChange={(value) => setFormData({ ...formData, section_id: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
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
                    placeholder="Lecture description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="video_url" className="text-right">
                    Video URL
                  </Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 45 minutes"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="order_index" className="text-right">
                    Order
                  </Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 0 })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_active" className="text-right">
                    Active
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingLecture ? "Update" : "Create") + " Lecture"}
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
                placeholder="Search lectures..."
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

      {/* Lectures Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Lectures</CardTitle>
          <CardDescription>
            {filteredLectures.length} lecture{filteredLectures.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading lectures...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Title</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Section</TableHead>
                  <TableHead className="text-slate-300">Duration</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Order</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLectures.map((lecture) => (
                  <TableRow key={lecture.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">
                      <div>
                        <p className="font-medium">{lecture.title}</p>
                        {lecture.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{lecture.description}</p>
                        )}
                        {lecture.video_url && (
                          <div className="flex items-center gap-1 mt-1">
                            <Play className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400">Video Available</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="font-medium">{lecture.section?.course?.code || "N/A"}</p>
                        <p className="text-sm text-slate-500">{lecture.section?.course?.name || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{lecture.section?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-300">
                      {lecture.duration ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lecture.duration}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={lecture.is_active ? "default" : "secondary"}
                        className={
                          lecture.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {lecture.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{lecture.order_index}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(lecture)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lecture.id)}
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

          {!loading && filteredLectures.length === 0 && (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No lectures found</p>
              <p className="text-slate-500 text-sm">Create your first lecture to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
