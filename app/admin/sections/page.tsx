"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { supabase, type Section, type Course } from "@/lib/supabase"
import { Plus, Edit, Trash2, Database, Search, Filter } from "lucide-react"
import { toast } from "sonner"

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    course_id: "",
    section_type: "study-tools" as "study-tools" | "topics",
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sectionsResult, coursesResult] = await Promise.all([
        supabase
          .from("sections")
          .select(`
            *,
            course:courses(name, code)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("courses").select("*").eq("is_active", true).order("name"),
      ])

      if (sectionsResult.error) throw sectionsResult.error
      if (coursesResult.error) throw coursesResult.error

      setSections(sectionsResult.data || [])
      setCourses(coursesResult.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error(`Failed to fetch data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.course_id) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        course_id: formData.course_id,
        section_type: formData.section_type,
        order_index: formData.order_index,
        is_active: formData.is_active,
      }

      if (editingSection) {
        const { error } = await supabase.from("sections").update(submitData).eq("id", editingSection.id)

        if (error) throw error
        toast.success("Section updated successfully")
      } else {
        const { error } = await supabase.from("sections").insert([submitData])

        if (error) throw error
        toast.success("Section created successfully")
      }

      setIsDialogOpen(false)
      setEditingSection(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving section:", error)
      toast.error(error.message || "Failed to save section")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (section: Section) => {
    setEditingSection(section)
    setFormData({
      name: section.name,
      course_id: section.course_id,
      section_type: section.section_type,
      order_index: section.order_index,
      is_active: section.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section? This will also delete all associated content.")) {
      return
    }

    try {
      const { error } = await supabase.from("sections").delete().eq("id", id)

      if (error) throw error
      toast.success("Section deleted successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting section:", error)
      toast.error(error.message || "Failed to delete section")
    }
  }

  const filteredSections = sections.filter(
    (section) =>
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.course?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      course_id: "",
      section_type: "study-tools",
      order_index: 0,
      is_active: true,
    })
    setEditingSection(null)
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
          <h1 className="text-3xl font-bold text-white">Sections</h1>
          <p className="text-slate-400 mt-2">Manage course sections and organization</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Edit Section" : "Add New Section"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingSection ? "Update section information" : "Create a new course section"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., Tools For Mid"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course_id" className="text-right">
                    Course *
                  </Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-white">
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="section_type" className="text-right">
                    Type *
                  </Label>
                  <Select
                    value={formData.section_type}
                    onValueChange={(value: "study-tools" | "topics") =>
                      setFormData({ ...formData, section_type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="study-tools" className="text-white">
                        Study Tools
                      </SelectItem>
                      <SelectItem value="topics" className="text-white">
                        Topics
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isSubmitting ? "Saving..." : (editingSection ? "Update" : "Create") + " Section"}
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
                placeholder="Search sections..."
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

      {/* Sections Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Sections</CardTitle>
          <CardDescription>
            {filteredSections.length} section{filteredSections.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading sections...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Order</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSections.map((section) => (
                  <TableRow key={section.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{section.name}</TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="font-medium">{section.course?.code}</p>
                        <p className="text-sm text-slate-500">{section.course?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <Badge
                        variant="outline"
                        className={
                          section.section_type === "study-tools"
                            ? "border-blue-500/50 text-blue-400"
                            : "border-green-500/50 text-green-400"
                        }
                      >
                        {section.section_type === "study-tools" ? "Study Tools" : "Topics"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{section.order_index}</TableCell>
                    <TableCell>
                      <Badge
                        variant={section.is_active ? "default" : "secondary"}
                        className={
                          section.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {section.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(section.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(section)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
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

          {!loading && filteredSections.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No sections found</p>
              <p className="text-slate-500 text-sm">Create your first section to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
