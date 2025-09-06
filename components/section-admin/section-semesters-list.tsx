"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Calendar,
  BookOpen,
  FileText,
  Play,
  MoreHorizontal,
  Edit3,
  Eye,
  Copy,
  Trash2,
  Search,
  Filter,
  Power,
  PowerOff,
  Loader2,
  GraduationCap
} from "lucide-react"

interface Semester {
  id: string
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  courses_count?: number
  topics_count?: number
  study_tools_count?: number
}

export function SectionSemestersList() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const mockSemesters: Semester[] = [
      {
        id: "1",
        title: "Spring 2024 - Computer Science",
        description: "Advanced computer science topics for spring semester",
        section: "CS-A",
        has_midterm: true,
        has_final: true,
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T14:30:00Z",
        courses_count: 8,
        topics_count: 45,
        study_tools_count: 23
      },
      {
        id: "2",
        title: "Fall 2023 - Software Engineering",
        description: "Comprehensive software engineering curriculum",
        section: "SE-B",
        has_midterm: true,
        has_final: true,
        is_active: true,
        created_at: "2023-08-20T09:00:00Z",
        updated_at: "2023-12-10T16:45:00Z",
        courses_count: 6,
        topics_count: 32,
        study_tools_count: 18
      },
      {
        id: "3",
        title: "Summer 2023 - Data Science",
        description: "Intensive data science and analytics program",
        section: "DS-A",
        has_midterm: false,
        has_final: true,
        is_active: false,
        created_at: "2023-05-10T11:00:00Z",
        updated_at: "2023-08-15T13:20:00Z",
        courses_count: 4,
        topics_count: 28,
        study_tools_count: 15
      }
    ]

    // Simulate API call delay
    setTimeout(() => {
      setSemesters(mockSemesters)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSemesters = semesters.filter(semester =>
    semester.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.section.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (semesterId: string) => {
    // Navigate to edit page
    console.log("Edit semester:", semesterId)
  }

  const handleView = (semesterId: string) => {
    // Navigate to view page
    console.log("View semester:", semesterId)
  }

  const handleDuplicate = (semesterId: string) => {
    // Duplicate semester
    console.log("Duplicate semester:", semesterId)
  }

  const handleDelete = (semesterId: string) => {
    // Delete semester
    console.log("Delete semester:", semesterId)
  }

  const toggleActive = (semesterId: string) => {
    setSemesters(prev => prev.map(semester => 
      semester.id === semesterId 
        ? { ...semester, is_active: !semester.is_active }
        : semester
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-muted-foreground">Loading semesters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search semesters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Semesters Table */}
      {filteredSemesters.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No semesters found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search criteria" : "Create your first semester to get started"}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Exams</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSemesters.map((semester) => (
                <TableRow key={semester.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{semester.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {semester.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {semester.section}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(semester.id)}
                        className={semester.is_active ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}
                      >
                        {semester.is_active ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <PowerOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Badge 
                        className={semester.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                        }
                      >
                        {semester.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span>{semester.courses_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span>{semester.topics_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4 text-orange-600" />
                        <span>{semester.study_tools_count}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleView(semester.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(semester.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Semester
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(semester.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(semester.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
