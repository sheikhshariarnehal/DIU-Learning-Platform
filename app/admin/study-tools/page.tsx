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
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, PenToolIcon as Tool, Search, Filter, ExternalLink, Database } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface StudyTool {
  id: string
  name: string
  section_id: string
  tool_type: "pdf" | "link" | "document"
  url: string
  icon_name?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

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

interface StudyToolWithRelations extends StudyTool {
  section?: Section & {
    course?: Course
  }
}

interface SectionWithCourse extends Section {
  course?: Course
}

export default function StudyToolsPage() {
  const [studyTools, setStudyTools] = useState<StudyToolWithRelations[]>([])
  const [sections, setSections] = useState<SectionWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<StudyTool | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    section_id: "",
    tool_type: "pdf" as "pdf" | "link" | "document",
    url: "",
    icon_name: "",
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

      // Check if the study_tools table exists
      const { error: tableCheckError } = await supabase.from("study_tools").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes("does not exist")) {
          setDbError("Database tables not found. Please run the setup scripts first.")
          setLoading(false)
          return
        }
        throw tableCheckError
      }

      // Fetch study tools with sections and courses separately to avoid relationship issues
      const { data: toolsData, error: toolsError } = await supabase
        .from("study_tools")
        .select("*")
        .order("created_at", { ascending: false })

      if (toolsError) throw toolsError

      // Fetch sections with courses
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("section_type", "study-tools")
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

      const toolsWithRelations =
        toolsData?.map((tool) => ({
          ...tool,
          section: sectionsWithCourses.find((section) => section.id === tool.section_id),
        })) || []

      setStudyTools(toolsWithRelations)
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

    if (!formData.name.trim() || !formData.section_id || !formData.url.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        section_id: formData.section_id,
        tool_type: formData.tool_type,
        url: formData.url.trim(),
        icon_name: formData.icon_name.trim() || null,
        order_index: formData.order_index,
        is_active: formData.is_active,
      }

      if (editingTool) {
        const { error } = await supabase.from("study_tools").update(submitData).eq("id", editingTool.id)

        if (error) throw error
        toast.success("Study tool updated successfully")
      } else {
        const { error } = await supabase.from("study_tools").insert([submitData])

        if (error) throw error
        toast.success("Study tool created successfully")
      }

      setIsDialogOpen(false)
      setEditingTool(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving study tool:", error)
      toast.error(error.message || "Failed to save study tool")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (tool: StudyTool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      section_id: tool.section_id,
      tool_type: tool.tool_type,
      url: tool.url,
      icon_name: tool.icon_name || "",
      order_index: tool.order_index,
      is_active: tool.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study tool?")) {
      return
    }

    try {
      const { error } = await supabase.from("study_tools").delete().eq("id", id)

      if (error) throw error
      toast.success("Study tool deleted successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error deleting study tool:", error)
      toast.error(error.message || "Failed to delete study tool")
    }
  }

  const filteredTools = studyTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.section?.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.section?.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      section_id: "",
      tool_type: "pdf",
      url: "",
      icon_name: "",
      order_index: 0,
      is_active: true,
    })
    setEditingTool(null)
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
            <h1 className="text-3xl font-bold text-white">Study Tools</h1>
            <p className="text-slate-400 mt-2">Manage study resources and tools</p>
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
          <CardContent className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-md">
              <h3 className="text-lg font-medium text-white mb-2">Step 1: Create Tables</h3>
              <pre className="bg-slate-950 p-3 rounded text-sm overflow-x-auto">
                <code className="text-green-400">
                  {`-- Run this SQL in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create semesters table
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('midterm', 'final')),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    textbook_url TEXT,
    slides_url TEXT,
    previous_questions_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, semester_id)
);

-- Create sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    section_type VARCHAR(20) NOT NULL CHECK (section_type IN ('study-tools', 'topics')),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_tools table
CREATE TABLE study_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    tool_type VARCHAR(20) NOT NULL CHECK (tool_type IN ('pdf', 'link', 'document')),
    url TEXT NOT NULL,
    icon_name VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_topic_title_per_section UNIQUE(title, section_id)
);

-- Create slides table
CREATE TABLE slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    slide_url TEXT NOT NULL,
    slide_type VARCHAR(20) NOT NULL CHECK (slide_type IN ('pdf', 'ppt', 'image')) DEFAULT 'pdf',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_slide_title_per_topic UNIQUE(title, topic_id)
);

-- Create videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    duration VARCHAR(20),
    thumbnail_url TEXT,
    video_type VARCHAR(20) NOT NULL CHECK (video_type IN ('youtube', 'vimeo', 'direct')) DEFAULT 'youtube',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_video_title_per_topic UNIQUE(title, topic_id)
);

-- Create lectures table (for backward compatibility)
CREATE TABLE lectures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(20),
    video_url TEXT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_topics_section_id ON topics(section_id);
CREATE INDEX idx_topics_order_index ON topics(order_index);
CREATE INDEX idx_slides_topic_id ON slides(topic_id);
CREATE INDEX idx_slides_order_index ON slides(order_index);
CREATE INDEX idx_videos_topic_id ON videos(topic_id);
CREATE INDEX idx_study_tools_section_id ON study_tools(section_id);
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_courses_semester_id ON courses(semester_id);`}
                </code>
              </pre>
            </div>

            <div className="bg-slate-900 p-4 rounded-md">
              <h3 className="text-lg font-medium text-white mb-2">Step 2: Add Sample Data</h3>
              <pre className="bg-slate-950 p-3 rounded text-sm overflow-x-auto">
                <code className="text-blue-400">
                  {`-- Insert a sample semester
INSERT INTO semesters (name, code, type) 
VALUES ('Fall 2023', 'FALL23', 'midterm');

-- Insert a sample course
INSERT INTO courses (name, code, semester_id) 
VALUES ('Introduction to Computer Science', 'CS101', 
  (SELECT id FROM semesters WHERE code = 'FALL23'));

-- Insert a study tools section
INSERT INTO sections (name, course_id, section_type) 
VALUES ('Study Resources', 
  (SELECT id FROM courses WHERE code = 'CS101' LIMIT 1), 
  'study-tools');

-- Insert a sample study tool
INSERT INTO study_tools (name, section_id, tool_type, url) 
VALUES ('Course Textbook', 
  (SELECT id FROM sections WHERE name = 'Study Resources' LIMIT 1), 
  'pdf', 
  'https://example.com/textbook.pdf');`}
                </code>
              </pre>
            </div>

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
          <h1 className="text-3xl font-bold text-white">Study Tools</h1>
          <p className="text-slate-400 mt-2">Manage study resources and tools</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Study Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTool ? "Edit Study Tool" : "Add New Study Tool"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingTool ? "Update study tool information" : "Create a new study tool"}
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
                    placeholder="e.g., Previous Questions"
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tool_type" className="text-right">
                    Type *
                  </Label>
                  <Select
                    value={formData.tool_type}
                    onValueChange={(value: "pdf" | "link" | "document") =>
                      setFormData({ ...formData, tool_type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select tool type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="pdf" className="text-white">
                        PDF
                      </SelectItem>
                      <SelectItem value="link" className="text-white">
                        Link
                      </SelectItem>
                      <SelectItem value="document" className="text-white">
                        Document
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL *
                  </Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="icon_name" className="text-right">
                    Icon Name
                  </Label>
                  <Input
                    id="icon_name"
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="col-span-3 bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., FileQuestion"
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
                  {isSubmitting ? "Saving..." : (editingTool ? "Update" : "Create") + " Study Tool"}
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
                placeholder="Search study tools..."
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

      {/* Study Tools Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">All Study Tools</CardTitle>
          <CardDescription>
            {filteredTools.length} study tool{filteredTools.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading study tools...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Section</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">URL</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.map((tool) => (
                  <TableRow key={tool.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{tool.name}</TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="font-medium">{tool.section?.course?.code || "N/A"}</p>
                        <p className="text-sm text-slate-500">{tool.section?.course?.name || "N/A"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{tool.section?.name || "N/A"}</TableCell>
                    <TableCell className="text-slate-300">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                        {tool.tool_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={tool.is_active ? "default" : "secondary"}
                        className={
                          tool.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                        }
                      >
                        {tool.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(tool.url, "_blank")}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tool)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tool.id)}
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

          {!loading && filteredTools.length === 0 && (
            <div className="text-center py-8">
              <Tool className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No study tools found</p>
              <p className="text-slate-500 text-sm">Create your first study tool to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
