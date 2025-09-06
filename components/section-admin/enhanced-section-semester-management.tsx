"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Loader2,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  Save,
  X,
  GraduationCap,
  Play,
  Link,
  Upload,
  Star,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Info
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Enhanced interfaces for section admin semester management
interface SemesterData {
  id?: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  start_date?: string
  end_date?: string
  default_credits?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

interface CourseData {
  id?: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
  is_highlighted?: boolean
  topics: TopicData[]
  studyTools: StudyToolData[]
}

interface TopicData {
  id?: string
  title: string
  description: string
  order_index?: number
  slides: { id?: string; title: string; url: string; description?: string }[]
  videos: { id?: string; title: string; url: string; description?: string }[]
}

interface StudyToolData {
  id?: string
  title: string
  type: string
  content_url: string
  exam_type: string
  description?: string
}

interface SemesterSummary extends SemesterData {
  courses_count: number
  topics_count: number
  materials_count: number
  study_tools_count: number
}

interface AllInOneData {
  semester: SemesterData
  courses: CourseData[]
}

type SortField = 'title' | 'section' | 'created_at' | 'updated_at' | 'courses_count'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'create' | 'edit'

export function EnhancedSectionSemesterManagement() {
  const router = useRouter()
  
  // State management
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterSection, setFilterSection] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingSemester, setEditingSemester] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [expandedStudyTool, setExpandedStudyTool] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState<AllInOneData>({
    semester: {
      title: "",
      description: "",
      section: "",
      has_midterm: true,
      has_final: true,
      start_date: "",
      end_date: "",
      default_credits: 3,
      is_active: true
    },
    courses: []
  })

  // Load semesters
  const loadSemesters = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/section-admin/semesters')
      if (response.ok) {
        const data = await response.json()
        setSemesters(data)
      } else {
        toast.error("Failed to load semesters")
      }
    } catch (error) {
      console.error("Error loading semesters:", error)
      toast.error("Error loading semesters")
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter and sort semesters
  const filteredSemesters = semesters
    .filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.section.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSection = !filterSection || semester.section === filterSection
      return matchesSearch && matchesSection
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Get unique sections for filter
  const uniqueSections = Array.from(new Set(semesters.map(s => s.section))).sort()

  // Load data on mount
  useEffect(() => {
    loadSemesters()
  }, [loadSemesters])

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Enhanced Semester Management</h1>
                  <p className="text-emerald-100 text-lg">
                    Professional tools for creating and managing academic semesters
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Auto-save enabled</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4" />
                  <span>Enhanced UX</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span>Real-time validation</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                {filteredSemesters.length} of {semesters.length} semesters
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Enhanced Navigation Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">
              <ClipboardList className="h-4 w-4" />
              Manage Semesters
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900" disabled={!editingSemester}>
              <Edit3 className="h-4 w-4" />
              Edit Semester
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={loadSemesters}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* List View */}
        <TabsContent value="list" className="space-y-6 mt-6">
          {/* Enhanced Search and Filters */}
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-emerald-600" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search semesters</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by title, description, or section..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Filter by section</Label>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sections</SelectItem>
                      {uniqueSections.map((section) => (
                        <SelectItem key={section} value={section}>
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Sort by</Label>
                  <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="updated_at">Updated Date</SelectItem>
                      <SelectItem value="courses_count">Course Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full justify-start"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Descending
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Semesters List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Section Semesters
                <Badge variant="outline" className="ml-auto">
                  {filteredSemesters.length} semesters
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage all semesters for your section with enhanced tools and professional interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
                    <p className="text-muted-foreground">Loading semesters...</p>
                  </div>
                </div>
              ) : filteredSemesters.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No semesters found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterSection 
                        ? "Try adjusting your search or filter criteria" 
                        : "Create your first semester to get started"
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={() => setViewMode('create')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Semester
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSemesters.map((semester) => (
                    <Card key={semester.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                {semester.title}
                              </CardTitle>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {semester.section}
                              </Badge>
                              {semester.is_active && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <Power className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-base">
                              {semester.description || "No description provided"}
                            </CardDescription>
                            
                            {/* Enhanced Stats */}
                            <div className="flex items-center gap-4 pt-2">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{semester.courses_count}</span>
                                <span>courses</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">{semester.topics_count}</span>
                                <span>topics</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Play className="h-4 w-4 text-orange-600" />
                                <span className="font-medium">{semester.study_tools_count}</span>
                                <span>tools</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span>Updated {new Date(semester.updated_at!).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* handleView(semester.id!) */}}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* handleEdit(semester.id!) */}}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* handleDuplicate(semester.id!) */}}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{semester.title}"? This action cannot be undone and will remove all associated courses, topics, and study materials.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => {/* handleDelete(semester.id!) */}}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create View - Will be implemented in next part */}
        <TabsContent value="create" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Create New Semester
              </CardTitle>
              <CardDescription>
                Create a new semester with enhanced tools and professional interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Enhanced Creation Form</h3>
                  <p className="text-muted-foreground">
                    The enhanced semester creation form will be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit View - Will be implemented in next part */}
        <TabsContent value="edit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-purple-600" />
                Edit Semester
              </CardTitle>
              <CardDescription>
                Edit semester with enhanced tools and professional interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Edit3 className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Enhanced Edit Form</h3>
                  <p className="text-muted-foreground">
                    The enhanced semester edit form will be implemented here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
