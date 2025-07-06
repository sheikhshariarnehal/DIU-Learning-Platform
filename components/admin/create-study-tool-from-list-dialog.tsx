"use client"

import React, { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"

interface Course {
  id: string
  title: string
  course_code: string
  semester: {
    name: string
  }
}

interface CreateStudyToolFromListDialogProps {
  children: React.ReactNode
  onSuccess: () => void
}

export function CreateStudyToolFromListDialog({ children, onSuccess }: CreateStudyToolFromListDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    content_url: "",
    exam_type: "both",
    course_id: "",
  })

  useEffect(() => {
    if (open) {
      fetchCourses()
    }
  }, [open])

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await fetch("/api/admin/courses")
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/study-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create study tool")
      }

      setOpen(false)
      setFormData({
        title: "",
        type: "",
        content_url: "",
        exam_type: "both",
        course_id: "",
      })
      onSuccess()
    } catch (error) {
      console.error("Error creating study tool:", error)
      alert(error instanceof Error ? error.message : "Failed to create study tool")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({
      title: "",
      type: "",
      content_url: "",
      exam_type: "both",
      course_id: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Study Tool</DialogTitle>
          <DialogDescription>Add exam materials, notes, or other study resources for a course.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-course">Course</Label>
              <Select 
                value={formData.course_id} 
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                disabled={loadingCourses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course.course_code}) - {course.semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                placeholder="e.g., Midterm Previous Questions 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select study tool type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous_questions">Previous Questions</SelectItem>
                  <SelectItem value="exam_note">Exam Notes</SelectItem>
                  <SelectItem value="syllabus">Syllabus</SelectItem>
                  <SelectItem value="mark_distribution">Mark Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-exam-type">Exam Type</Label>
              <Select 
                value={formData.exam_type} 
                onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm Only</SelectItem>
                  <SelectItem value="final">Final Only</SelectItem>
                  <SelectItem value="both">Both Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-content-url">Content URL</Label>
              <Input
                id="create-content-url"
                type="url"
                placeholder="https://drive.google.com/file/..."
                value={formData.content_url}
                onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.type || !formData.course_id}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Study Tool"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
