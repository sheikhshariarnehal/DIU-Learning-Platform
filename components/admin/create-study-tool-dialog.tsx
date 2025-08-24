"use client"

import type React from "react"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface CreateStudyToolDialogProps {
  children: React.ReactNode
  courseId: string
}

export function CreateStudyToolDialog({ children, courseId }: CreateStudyToolDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    content_url: "",
    exam_type: "both",
    description: "",
  })
  const router = useRouter()

  // Helper function to determine which fields should be shown based on study tool type
  const getStudyToolFieldConfig = (type: string) => {
    switch (type) {
      case "previous_questions":
        return {
          showTitle: true,
          showContentUrl: true,
          showDescription: false,
          showExamType: true,
          titlePlaceholder: "e.g., Previous Questions 2024",
          descriptionPlaceholder: ""
        }
      case "exam_note":
        return {
          showTitle: true,
          showContentUrl: true,
          showDescription: false,
          showExamType: true,
          titlePlaceholder: "e.g., Exam Notes - Chapter 1-5",
          descriptionPlaceholder: ""
        }
      case "syllabus":
        return {
          showTitle: true,
          showContentUrl: false,
          showDescription: true,
          showExamType: false,
          titlePlaceholder: "e.g., Course Syllabus",
          descriptionPlaceholder: "Describe the syllabus content, topics covered, etc."
        }
      case "mark_distribution":
        return {
          showTitle: true,
          showContentUrl: true,
          showDescription: false,
          showExamType: true,
          titlePlaceholder: "e.g., Mark Distribution Scheme",
          descriptionPlaceholder: ""
        }
      default:
        return {
          showTitle: true,
          showContentUrl: true,
          showDescription: true,
          showExamType: true,
          titlePlaceholder: "e.g., Study Material",
          descriptionPlaceholder: "Describe this study tool..."
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Process form data to handle database constraints
      const processedData = {
        ...formData,
        content_url: formData.content_url?.trim() || null,
        description: formData.description?.trim() || null,
        course_id: courseId,
      }

      const { error } = await supabase.from("study_tools").insert([processedData])

      if (error) {
        throw error
      }

      setOpen(false)
      setFormData({
        title: "",
        type: "",
        content_url: "",
        exam_type: "both",
        description: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating study tool:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Study Tool</DialogTitle>
          <DialogDescription>Add exam materials, notes, or other study resources for this course.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {(() => {
              const fieldConfig = getStudyToolFieldConfig(formData.type)
              return (
                <>
                  {fieldConfig.showTitle && (
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder={fieldConfig.titlePlaceholder}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tool type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previous_questions">Previous Questions</SelectItem>
                        <SelectItem value="exam_note">Exam Notes</SelectItem>
                        <SelectItem value="syllabus">Syllabus</SelectItem>
                        <SelectItem value="mark_distribution">Mark Distribution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {fieldConfig.showExamType && (
                    <div className="grid gap-2">
                      <Label htmlFor="exam_type">Exam Type</Label>
                      <Select
                        value={formData.exam_type}
                        onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="midterm">Midterm Only</SelectItem>
                          <SelectItem value="final">Final Only</SelectItem>
                          <SelectItem value="both">Both Exams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {fieldConfig.showContentUrl && (
                    <div className="grid gap-2">
                      <Label htmlFor="content_url">Content URL</Label>
                      <Input
                        id="content_url"
                        type="url"
                        placeholder="https://drive.google.com/file/..."
                        value={formData.content_url}
                        onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                      />
                    </div>
                  )}
                  {fieldConfig.showDescription && (
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder={fieldConfig.descriptionPlaceholder}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )
            })()}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.type}>
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
