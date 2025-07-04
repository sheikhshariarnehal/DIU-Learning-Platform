"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { supabase, createSemester, updateSemester, type Semester } from "@/lib/supabase"
import { Plus, Edit, Trash2, Calendar, Search, Filter } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "midterm" as "midterm" | "final",
    start_date: "",
    end_date: "",
    is_active: true,
  })

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/semesters")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSemesters(data || [])
    } catch (error: any) {
      console.error("Error fetching semesters:", error)
      toast.error(`Failed to fetch semesters: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required")
      return
    }

    // Additional validation
    if (formData.name.trim().length < 2) {
      toast.error("Semester name must be at least 2 characters long")
      return
    }

    if (formData.code.trim().length < 2) {
      toast.error("Semester code must be at least 2 characters long")
      return
    }

    if (!["midterm", "final"].includes(formData.type)) {
      toast.error("Invalid semester type")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        exam_type: formData.type,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
      }

      console.log("Submitting semester data:", submitData)

      if (editingSemester) {
        await updateSemester(editingSemester.id, submitData)
        toast.success("Semester updated successfully")
      } else {
        await createSemester(submitData)
        toast.success("Semester created successfully")
      }

      setIsDialogOpen(false)
      setEditingSemester(null)
      resetForm()
      fetchSemesters()
    } catch (error: any) {
      console.error("Error saving semester:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        error: error
      })

      // Provide more specific error messages
      let errorMessage = "Failed to save semester"

      if (error?.code === "23505") {
        errorMessage = "A semester with this code already exists"
      } else if (error?.code === "23503") {
        errorMessage = "Invalid data provided"
      } else if (error?.code === "42501") {
        errorMessage = "You don't have permission to perform this action"
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester)
    setFormData({
      name: semester.name,
      code: semester.code,
      type: semester.exam_type,
      start_date: semester.start_date || "",
      end_date: semester.end_date || "",
      is_active: semester.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this semester? This will also delete all associated courses.")) {
      return
    }

    try {
      const { error } = await supabase.from("semesters").delete().eq("id", id)

      if (error) throw error
      toast.success("Semester deleted successfully")
      fetchSemesters()
    } catch (error: any) {
      console.error("Error deleting semester:", error)
      toast.error(error.message || "Failed to delete semester")
    }
  }

  const filteredSemesters = semesters.filter(
    (semester) =>
      semester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      semester.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "midterm",
      start_date: "",
      end_date: "",
      is_active: true,
    })
    setEditingSemester(null)
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
          <h1 className="text-3xl font-bold text-white">Semesters</h1>
          <p className="text-slate-400 mt-2">Manage academic semesters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingSemester ? "Edit Semester" : "Add New Semester"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingSemester ? "Update semester information" : "Create a new academic semester"}
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
                    placeholder="e.g., Fall 2024"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code *
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., FALL2024"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "midterm" | "final") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="midterm" className="text-white">
                        Midterm
                      </SelectItem>
                      <SelectItem value="final" className="text-white">
                        Final
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
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
                  {isSubmitting ? "Saving..." : (editingSemester ? "Update" : "Create") + " Semester"}
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
                placeholder="Search semesters..."
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

      {/* Semesters Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Semesters</CardTitle>
          <CardDescription>
            {filteredSemesters.length} semester{filteredSemesters.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading semesters...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Code</TableHead>
                  <TableHead className="text-slate-300">Duration</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSemesters.map((semester) => (
                  <TableRow key={semester.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{semester.name}</TableCell>
                    <TableCell className="text-slate-300">{semester.code}</TableCell>
                    <TableCell className="text-slate-300">
                      {semester.start_date && semester.end_date ? (
                        <div className="text-sm">
                          <div>{new Date(semester.start_date).toLocaleDateString()}</div>
                          <div className="text-slate-500">to {new Date(semester.end_date).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={semester.is_active ? "default" : "secondary"}
                        className={
                          semester.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {semester.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(semester.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(semester)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(semester.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <Badge
                        variant="outline"
                        className={
                          semester.type === "midterm"
                            ? "border-blue-500/50 text-blue-400"
                            : "border-purple-500/50 text-purple-400"
                        }
                      >
                        {semester.type === "midterm" ? "Midterm" : "Final"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredSemesters.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No semesters found</p>
              <p className="text-slate-500 text-sm">Create your first semester to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
