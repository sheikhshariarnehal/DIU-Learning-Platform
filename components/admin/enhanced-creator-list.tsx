"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
  RefreshCw
} from "lucide-react"

interface SemesterSummary {
  id: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  courses_count: number
  topics_count: number
  materials_count: number
  study_tools_count: number
}

type SortField = 'title' | 'section' | 'created_at' | 'updated_at' | 'courses_count'
type SortOrder = 'asc' | 'desc'

export function EnhancedCreatorList() {
  const router = useRouter()
  const [semesters, setSemesters] = useState<SemesterSummary[]>([])
  const [filteredSemesters, setFilteredSemesters] = useState<SemesterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterSection, setFilterSection] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Load semesters data
  const loadSemesters = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/enhanced-creator/list')

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Loaded semesters data:', data) // Debug log
      setSemesters(data.semesters || [])

      if (data.semesters?.length === 0) {
        toast.info('No semesters found. Create your first semester!')
      }
    } catch (error) {
      console.error('Error loading semesters:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to load semesters: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort semesters
  useEffect(() => {
    let filtered = semesters.filter(semester => {
      const matchesSearch = semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           semester.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSection = filterSection === "all" || semester.section === filterSection
      
      return matchesSearch && matchesSection
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredSemesters(filtered)
  }, [semesters, searchTerm, sortField, sortOrder, filterSection])

  // Get unique sections for filter
  const uniqueSections = Array.from(new Set(semesters.map(s => s.section))).sort()

  // Load data on mount
  useEffect(() => {
    loadSemesters()
  }, [])

  // Handle actions
  const handleEdit = (semesterId: string) => {
    router.push(`/admin/enhanced-creator/edit/${semesterId}`)
  }

  const handleView = (semesterId: string) => {
    router.push(`/admin/enhanced-creator/view/${semesterId}`)
  }

  const handleDuplicate = async (semesterId: string) => {
    try {
      const response = await fetch(`/api/admin/enhanced-creator/duplicate/${semesterId}`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to duplicate semester')
      
      const result = await response.json()
      toast.success(`Successfully duplicated semester: ${result.title}`)
      loadSemesters() // Refresh list
    } catch (error) {
      console.error('Error duplicating semester:', error)
      toast.error('Failed to duplicate semester')
    }
  }

  const handleDelete = async (semesterId: string) => {
    setIsDeleting(semesterId)
    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete semester')
      
      toast.success('Semester deleted successfully')
      loadSemesters() // Refresh list
    } catch (error) {
      console.error('Error deleting semester:', error)
      toast.error('Failed to delete semester')
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading semesters...</span>
        </div>
      </div>
    )
  }

  // Show empty state if no semesters and not loading
  if (!isLoading && semesters.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/enhanced-creator')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Semester
            </Button>
            <Button variant="outline" onClick={loadSemesters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <Badge variant="secondary" className="text-sm">
            0 semesters
          </Badge>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Enhanced Semesters Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first semester with the Enhanced All-in-One Creator.
                Build complete semester structures with courses, topics, materials, and study tools.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => router.push('/admin/enhanced-creator')} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Semester
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/test-db')}>
                  Test Database Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/admin/enhanced-creator')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Semester
          </Button>
          <Button variant="outline" onClick={loadSemesters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          {filteredSemesters.length} of {semesters.length} semesters
        </Badge>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, section, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Section</label>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {uniqueSections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-') as [SortField, SortOrder]
                setSortField(field)
                setSortOrder(order)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                  <SelectItem value="created_at-desc">Recently Created</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="section-asc">Section A-Z</SelectItem>
                  <SelectItem value="courses_count-desc">Most Courses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Semesters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Creator Semesters</CardTitle>
          <CardDescription>
            All semesters created with the Enhanced All-in-One Creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSemesters.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No semesters found</h3>
              <p className="text-muted-foreground mb-4">
                {semesters.length === 0 
                  ? "Create your first semester with the Enhanced Creator"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              <Button onClick={() => router.push('/admin/enhanced-creator')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Semester
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Semester {getSortIcon('title')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort('section')}
                    >
                      <div className="flex items-center gap-2">
                        Section {getSortIcon('section')}
                      </div>
                    </TableHead>
                    <TableHead>Content Summary</TableHead>
                    <TableHead>Exams</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleSort('updated_at')}
                    >
                      <div className="flex items-center gap-2">
                        Last Updated {getSortIcon('updated_at')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSemesters.map((semester) => (
                    <TableRow key={semester.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{semester.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {semester.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{semester.section}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-3 w-3" />
                            {semester.courses_count} Courses
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <FileText className="h-3 w-3" />
                            {semester.topics_count} Topics
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <ClipboardList className="h-3 w-3" />
                            {semester.study_tools_count} Study Tools
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {semester.has_midterm && (
                            <Badge variant="secondary" className="text-xs">Midterm</Badge>
                          )}
                          {semester.has_final && (
                            <Badge variant="secondary" className="text-xs">Final</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(semester.updated_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(semester.updated_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(semester.id)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(semester.id)}
                            title="Edit Semester"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(semester.id)}
                            title="Duplicate Semester"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                title="Delete Semester"
                              >
                                {isDeleting === semester.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Semester</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{semester.title}"? 
                                  This will permanently remove the semester and all its courses, 
                                  topics, slides, videos, and study tools. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(semester.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
