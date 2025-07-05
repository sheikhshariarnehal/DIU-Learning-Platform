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
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface Course {
  id: string
  title: string
  course_code: string
}

interface CreateTopicFromListDialogProps {
  children: React.ReactNode
}

export function CreateTopicFromListDialog({ children }: CreateTopicFromListDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [formData, setFormData] = useState({
    title: "",
    course_id: "",
    order_index: 1,
    description: "",
  })
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchCourses()
    }
  }, [open])

  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("id, title, course_code").order("title")

    if (!error && data) {
      setCourses(data)
    }
  }

  const fetchNextOrderIndex = async (courseId: string) => {
    const { data, error } = await supabase
      .from("topics")
      .select("order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        order_index: data[0].order_index + 1,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        order_index: 1,
      }))
    }
  }

  const handleCourseChange = (courseId: string) => {
    setFormData({ ...formData, course_id: courseId })
    fetchNextOrderIndex(courseId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("topics").insert([formData])

      if (error) {
        throw error
      }

      setOpen(false)
      setFormData({
        title: "",
        course_id: "",
        order_index: 1,
        description: "",
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating topic:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Topic</DialogTitle>
          <DialogDescription>Add a new topic to organize course content like slides and videos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select value={formData.course_id} onValueChange={handleCourseChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Topic Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to IoT"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this topic covers"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.course_id}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
