"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Search, Filter, Grid, List, SortAsc, SortDesc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EnhancedCourseCard } from "./enhanced-course-card"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  description?: string
  credits?: number
  is_highlighted: boolean
  created_at: string
  updated_at: string
  semester?: {
    id: string
    title: string
    section: string
    is_active: boolean
  }
}

interface CourseGridProps {
  courses: Course[]
  loading?: boolean
  onCourseSelect?: (courseId: string) => void
  onContentSelect?: (content: any) => void
  onEdit?: (courseId: string) => void
  onDelete?: (courseId: string) => void
  showActions?: boolean
  className?: string
}

type ViewMode = "grid" | "list"
type SortField = "title" | "course_code" | "teacher_name" | "created_at"
type SortOrder = "asc" | "desc"

export function ProfessionalCourseGrid({
  courses,
  loading = false,
  onCourseSelect,
  onContentSelect,
  onEdit,
  onDelete,
  showActions = false,
  className
}: CourseGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortField, setSortField] = useState<SortField>("title")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  // Get unique semesters for filtering
  const semesters = useMemo(() => {
    const semesterSet = new Set<string>()
    courses.forEach(course => {
      if (course.semester) {
        semesterSet.add(`${course.semester.title} - ${course.semester.section}`)
      }
    })
    return Array.from(semesterSet)
  }, [courses])

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSemester = selectedSemester === "all" || 
                             (course.semester && `${course.semester.title} - ${course.semester.section}` === selectedSemester)
      
      return matchesSearch && matchesSemester
    })

    // Sort courses
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "course_code":
          aValue = a.course_code.toLowerCase()
          bValue = b.course_code.toLowerCase()
          break
        case "teacher_name":
          aValue = a.teacher_name.toLowerCase()
          bValue = b.teacher_name.toLowerCase()
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Prioritize highlighted courses
    return filtered.sort((a, b) => {
      if (a.is_highlighted && !b.is_highlighted) return -1
      if (!a.is_highlighted && b.is_highlighted) return 1
      return 0
    })
  }, [courses, searchQuery, selectedSemester, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Semester Filter */}
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map(semester => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("title")}>
                Course Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("course_code")}>
                Course Code {sortField === "course_code" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("teacher_name")}>
                Instructor {sortField === "teacher_name" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("created_at")}>
                Date Created {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedCourses.length} course{filteredAndSortedCourses.length !== 1 ? 's' : ''}
          </span>
          {filteredAndSortedCourses.filter(c => c.is_highlighted).length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filteredAndSortedCourses.filter(c => c.is_highlighted).length} featured
            </Badge>
          )}
        </div>
      </div>

      {/* Course Grid/List */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No courses found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"
        )}>
          {filteredAndSortedCourses.map((course) => (
            <EnhancedCourseCard
              key={course.id}
              course={course}
              variant={viewMode === "list" ? "compact" : "default"}
              showActions={showActions}
              onCourseSelect={onCourseSelect}
              onContentSelect={onContentSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
