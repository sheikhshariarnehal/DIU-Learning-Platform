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
import { supabase, type Course, type Semester } from "@/lib/supabase"
import { Plus, Edit, Trash2, BookOpen, Search, Filter, ExternalLink, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    semester_id: "",
    textbook_url: "",
    slides_url: "",
    previous_questions_url: "",
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesResult, semestersResult] = await Promise.all([
        supabase
          .from("courses")
          .select(`
            *,
            semester:semesters(name, code)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("semesters").select("*").eq("is_active", true).order("name"),
      ])

      if (coursesResult.error) {
        console.error("Courses error:", coursesResult.error)
        throw coursesResult.error
      }
      if (semestersResult.error) {
        console.error("Semesters error:", semestersResult.error)
        throw semestersResult.error
      }

      setCourses(coursesResult.data || [])
      setSemesters(semestersResult.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error(`Failed to fetch data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.code.trim() || !formData.name.trim() || !formData.semester_id) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        semester_id: formData.semester_id,
        textbook_url: formData.textbook_url.trim() || null,
        slides_url: formData.slides_url.trim() || null,
        previous_questions_url: formData.previous_questions_url.trim() || null,
        is_active: formData.is_active,
      }

      if (editingCourse) {
        const { error } = await supabase.from("courses").update(submitData).eq("id", editingCourse.id)

        if (error) throw error
        toast.success("Course updated successfully")
      } else {
        const { error } = await supabase.from("courses").insert([submitData])

        if (error) throw error
        toast.success("Course created successfully")
      }

      setIsDialogOpen(false)
      setEditingCourse(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving course:", error)
      if (error.code === "23505") {
        toast.error("A course with this code already exists in this semester")
      } else {
        toast.error(error.message || "Failed to save course")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || "",
      semester_id: course.semester_id,
      textbook_url: course.textbook_url || "",
      slides_url: course.slides_url || "",
      previous_questions_url: course.previous_questions_url || "",
      is_active: course.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will also delete all associated sections and lectures.",
      )
    ) {
      return
    }

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id)

      if (error) throw error
      toast.success("Course deleted successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting course:", error)
      toast.error(error.message || "Failed to delete course")
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      semester_id: "",
      textbook_url: "",
      slides_url: "",
      previous_questions_url: "",
      is_active: true,
    })
    setEditingCourse(null)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <p className="text-slate-400 mt-2">Manage course catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingCourse ? "Update course information" : "Create a new course"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code *
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., CSE325"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Data Mining and Machine Learning"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="semester_id" className="text-right">
                    Semester *
                  </Label>
                  <Select
                    value={formData.semester_id}
                    onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {semesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id} className="text-white">
                          {semester.name}
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
                    placeholder="Course description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="textbook_url" className="text-right">
                    Textbook URL
                  </Label>
                  <Input
                    id="textbook_url"
                    value={formData.textbook_url}
                    onChange={(e) => setFormData({ ...formData, textbook_url: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slides_url" className="text-right">
                    Slides URL
                  </Label>
                  <Input
                    id="slides_url"
                    value={formData.slides_url}
                    onChange={(e) => setFormData({ ...formData, slides_url: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="previous_questions_url" className="text-right">
                    Previous Questions
                  </Label>
                  <Input
                    id="previous_questions_url"
                    value={formData.previous_questions_url}
                    onChange={(e) => setFormData({ ...formData, previous_questions_url: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="https://drive.google.com/..."
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
                  {isSubmitting ? "Saving..." : (editingCourse ? "Update" : "Create") + " Course"}
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
                placeholder="Search courses..."
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

      {/* Courses Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Courses</CardTitle>
          <CardDescription>
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading courses...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Code</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Semester</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Resources</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{course.code}</TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="font-medium">{course.name}</p>
                        {course.description && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{course.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{course.semester?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={course.is_active ? "default" : "secondary"}
                        className={
                          course.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {course.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {course.textbook_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(course.textbook_url, "_blank")}
                            className="text-blue-400 hover:text-blue-300"
                            title="Textbook"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        {course.slides_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(course.slides_url, "_blank")}
                            className="text-green-400 hover:text-green-300"
                            title="Slides"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        {course.previous_questions_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(course.previous_questions_url, "_blank")}
                            className="text-purple-400 hover:text-purple-300"
                            title="Previous Questions"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{new Date(course.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/courses/${course.id}/topics`)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          title="Manage Topics"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(course)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                          className="text-red-400 hover:text-red-300"
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

          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No courses found</p>
              <p className="text-slate-500 text-sm">Create your first course to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
