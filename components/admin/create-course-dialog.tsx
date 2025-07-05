"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface CreateCourseDialogProps {
  children: React.ReactNode
}

interface Semester {
  id: string
  title: string
  section: string | null
}

export function CreateCourseDialog({ children }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [formData, setFormData] = useState({
    title: "",
    course_code: "",
    teacher_name: "",
    semester_id: "",
  })
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchSemesters()
    }
  }, [open])

  const fetchSemesters = async () => {
    const { data, error } = await supabase
      .from("semesters")
      .select("id, title, section")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching semesters:", error)
      return
    }

    setSemesters(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("courses").insert([formData])

      if (error) {
        throw error
      }

      setOpen(false)
      setFormData({
        title: "",
        course_code: "",
        teacher_name: "",
        semester_id: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to a semester with topics and content.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g., Internet of Things"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course_code">Course Code</Label>
              <Input
                id="course_code"
                placeholder="e.g., CSE 422"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="teacher_name">Teacher Name</Label>
              <Input
                id="teacher_name"
                placeholder="e.g., Dr. Ahmed Rahman"
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={formData.semester_id}
                onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.title} {semester.section && `(${semester.section})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.semester_id}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
