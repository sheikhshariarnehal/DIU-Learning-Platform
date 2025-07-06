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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface StudyTool {
  id: string
  title: string
  type: string
  content_url: string | null
  exam_type: string
  course: {
    id: string
    title: string
    course_code: string
  }
}

interface EditStudyToolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studyTool: StudyTool | null
  onSuccess: () => void
}

export function EditStudyToolDialog({ open, onOpenChange, studyTool, onSuccess }: EditStudyToolDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    content_url: "",
    exam_type: "both",
  })

  // Update form data when studyTool changes
  useEffect(() => {
    if (studyTool) {
      setFormData({
        title: studyTool.title,
        type: studyTool.type,
        content_url: studyTool.content_url || "",
        exam_type: studyTool.exam_type,
      })
    }
  }, [studyTool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studyTool) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/study-tools/${studyTool.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update study tool")
      }

      onSuccess()
    } catch (error) {
      console.error("Error updating study tool:", error)
      alert(error instanceof Error ? error.message : "Failed to update study tool")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form when closing
    if (studyTool) {
      setFormData({
        title: studyTool.title,
        type: studyTool.type,
        content_url: studyTool.content_url || "",
        exam_type: studyTool.exam_type,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Study Tool</DialogTitle>
          <DialogDescription>
            Update the study tool details for {studyTool?.course.title} ({studyTool?.course.course_code}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Midterm Previous Questions 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
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
              <Label htmlFor="edit-exam-type">Exam Type</Label>
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
              <Label htmlFor="edit-content-url">Content URL</Label>
              <Input
                id="edit-content-url"
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
            <Button type="submit" disabled={isLoading || !formData.type}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Study Tool"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
