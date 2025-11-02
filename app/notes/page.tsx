"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, Eye, Search, Filter, BookOpen, Calendar, User, ExternalLink, AlertCircle } from "lucide-react"
import { ExamNote } from "@/lib/types/notes"

export default function NotesPage() {
  const [notes, setNotes] = useState<ExamNote[]>([])
  const [filteredNotes, setFilteredNotes] = useState<ExamNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [examTypeFilter, setExamTypeFilter] = useState("all")
  const [semesterFilter, setSemesterFilter] = useState("all")
  
  // Extract unique values for filters
  const semesters = Array.from(new Set(notes.map((n) => n.semester_title).filter(Boolean))) as string[]
  const examTypes = Array.from(new Set(notes.map((n) => n.exam_type).filter(Boolean))) as string[]

  // Fetch notes from API
  useEffect(() => {
    fetchNotes()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...notes]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.course_title?.toLowerCase().includes(query) ||
          note.course_code?.toLowerCase().includes(query) ||
          note.teacher_name?.toLowerCase().includes(query) ||
          note.description?.toLowerCase().includes(query)
      )
    }

    if (examTypeFilter !== "all") {
      filtered = filtered.filter((note) => note.exam_type === examTypeFilter)
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter((note) => note.semester_title === semesterFilter)
    }

    setFilteredNotes(filtered)
  }, [searchQuery, examTypeFilter, semesterFilter, notes])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/notes")
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch notes")
      }

      setNotes(data.data || [])
      setFilteredNotes(data.data || [])
    } catch (err) {
      console.error("Error fetching notes:", err)
      setError(err instanceof Error ? err.message : "Failed to load exam notes")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    } catch {
      return dateString
    }
  }

  const getExamTypeBadgeColor = (examType: string) => {
    switch (examType) {
      case "midterm":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "final":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
      case "both":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "assignment":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
      case "quiz":
        return "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const handleViewNote = (contentUrl: string) => {
    window.open(contentUrl, "_blank", "noopener,noreferrer")
  }

  const clearFilters = () => {
    setSearchQuery("")
    setExamTypeFilter("all")
    setSemesterFilter("all")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Exam Notes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Access comprehensive exam notes and study materials for all your courses.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, courses, teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Exam Type Filter */}
              <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exam Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Semester Filter */}
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || examTypeFilter !== "all" || semesterFilter !== "all") && (
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">Search: {searchQuery}</Badge>
                )}
                {examTypeFilter !== "all" && (
                  <Badge variant="secondary">Type: {examTypeFilter}</Badge>
                )}
                {semesterFilter !== "all" && (
                  <Badge variant="secondary">Semester: {semesterFilter}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredNotes.length}</span> of{" "}
              <span className="font-semibold text-foreground">{notes.length}</span> exam notes
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotes}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Notes Grid */}
        {!loading && !error && filteredNotes.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {note.title}
                      </CardTitle>
                      {note.description && (
                        <CardDescription className="text-sm line-clamp-2">
                          {note.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Course Info */}
                    {note.course_code && note.course_title && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{note.course_code}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground line-clamp-1">{note.course_title}</span>
                        </div>
                        {note.teacher_name && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="line-clamp-1">{note.teacher_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getExamTypeBadgeColor(note.exam_type)}>
                        {note.exam_type.charAt(0).toUpperCase() + note.exam_type.slice(1)}
                      </Badge>
                      {note.semester_title && (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {note.semester_title}
                        </Badge>
                      )}
                      {note.section && (
                        <Badge variant="secondary">
                          {note.section}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        <span>{note.download_count || 0} downloads</span>
                      </div>
                      {note.file_size_mb && (
                        <span>{note.file_size_mb.toFixed(1)} MB</span>
                      )}
                    </div>
                    
                    {/* Updated Date */}
                    <div className="text-xs text-muted-foreground">
                      Updated: {formatDate(note.updated_at)}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewNote(note.content_url)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNotes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No exam notes found</h3>
                  <p className="text-muted-foreground mb-4">
                    {notes.length === 0
                      ? "No exam notes are available yet. Check back later!"
                      : "Try adjusting your filters to see more results."}
                  </p>
                  {notes.length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {!loading && !error && notes.length > 0 && (
          <div className="mt-12">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find the exam notes you're looking for? Contact your course instructor or check back later for updates.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {notes.length} Total Notes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {semesters.length} Semesters
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Array.from(new Set(notes.map((n) => n.course_code).filter(Boolean))).length} Courses
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
