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
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface CreateSemesterDialogProps {
  children: React.ReactNode
}

export function CreateSemesterDialog({ children }: CreateSemesterDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section: "",
    has_midterm: true,
    has_final: true,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("semesters").insert([formData])

      if (error) {
        throw error
      }

      setOpen(false)
      setFormData({
        title: "",
        description: "",
        section: "",
        has_midterm: true,
        has_final: true,
      })
      router.refresh()
    } catch (error) {
      console.error("Error creating semester:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Semester</DialogTitle>
          <DialogDescription>Add a new semester to organize your courses and content.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Spring 2025"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                placeholder="e.g., 63_G"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the semester"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Exam Types</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="midterm"
                  checked={formData.has_midterm}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_midterm: checked as boolean })}
                />
                <Label htmlFor="midterm">Has Midterm Exam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="final"
                  checked={formData.has_final}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_final: checked as boolean })}
                />
                <Label htmlFor="final">Has Final Exam</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Semester"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
