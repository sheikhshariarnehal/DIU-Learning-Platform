"use client"

import { useState } from "react"
import { EnhancedCourseCard } from "@/components/ui/enhanced-course-card"
import { ProfessionalCourseGrid } from "@/components/ui/professional-course-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Eye, Code } from "lucide-react"

// Sample course data for demonstration
const sampleCourses = [
  {
    id: "1",
    title: "Advanced React Development",
    course_code: "CS-401",
    teacher_name: "Dr. Sarah Johnson",
    teacher_email: "sarah.johnson@university.edu",
    description: "Master advanced React concepts including hooks, context, and performance optimization",
    credits: 4,
    is_highlighted: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    semester: {
      id: "sem1",
      title: "Spring 2024",
      section: "A",
      is_active: true
    }
  },
  {
    id: "2",
    title: "Database Systems",
    course_code: "CS-302",
    teacher_name: "Prof. Michael Chen",
    teacher_email: "michael.chen@university.edu",
    description: "Comprehensive study of database design, SQL, and database management systems",
    credits: 3,
    is_highlighted: false,
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T14:20:00Z",
    semester: {
      id: "sem1",
      title: "Spring 2024",
      section: "B",
      is_active: true
    }
  },
  {
    id: "3",
    title: "Machine Learning Fundamentals",
    course_code: "CS-450",
    teacher_name: "Dr. Emily Rodriguez",
    teacher_email: "emily.rodriguez@university.edu",
    description: "Introduction to machine learning algorithms and their practical applications",
    credits: 4,
    is_highlighted: true,
    created_at: "2024-01-12T11:00:00Z",
    updated_at: "2024-01-22T16:45:00Z",
    semester: {
      id: "sem2",
      title: "Fall 2024",
      section: "A",
      is_active: false
    }
  },
  {
    id: "4",
    title: "Web Development Basics",
    course_code: "CS-201",
    teacher_name: "Prof. David Kim",
    teacher_email: "david.kim@university.edu",
    description: "Learn HTML, CSS, JavaScript and modern web development practices",
    credits: 3,
    is_highlighted: false,
    created_at: "2024-01-08T08:30:00Z",
    updated_at: "2024-01-19T13:15:00Z",
    semester: {
      id: "sem1",
      title: "Spring 2024",
      section: "C",
      is_active: true
    }
  },
  {
    id: "5",
    title: "Software Engineering Principles",
    course_code: "CS-350",
    teacher_name: "Dr. Lisa Wang",
    teacher_email: "lisa.wang@university.edu",
    description: "Software development lifecycle, design patterns, and project management",
    credits: 4,
    is_highlighted: false,
    created_at: "2024-01-14T12:00:00Z",
    updated_at: "2024-01-21T17:30:00Z",
    semester: {
      id: "sem2",
      title: "Fall 2024",
      section: "A",
      is_active: false
    }
  }
]

const sampleStats = {
  totalTopics: 12,
  totalVideos: 45,
  totalSlides: 120,
  totalStudyTools: 8,
  completedItems: 67,
  enrolledStudents: 156
}

export default function CourseCardsDemo() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId)
    console.log("Selected course:", courseId)
  }

  const handleContentSelect = (content: any) => {
    console.log("Selected content:", content)
  }

  const handleEdit = (courseId: string) => {
    console.log("Edit course:", courseId)
  }

  const handleDelete = (courseId: string) => {
    console.log("Delete course:", courseId)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Enhanced Course Cards Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional, functional, and responsive course card components with modern design patterns
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            <Eye className="h-4 w-4 mr-1" />
            Interactive Demo
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Code className="h-4 w-4 mr-1" />
            TypeScript + Tailwind
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Professional Grid</TabsTrigger>
          <TabsTrigger value="individual">Individual Cards</TabsTrigger>
          <TabsTrigger value="variants">Card Variants</TabsTrigger>
        </TabsList>

        {/* Professional Grid View */}
        <TabsContent value="grid" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Course Grid</CardTitle>
              <CardDescription>
                Complete grid layout with search, filtering, sorting, and responsive design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfessionalCourseGrid
                key={refreshKey}
                courses={sampleCourses}
                onCourseSelect={handleCourseSelect}
                onContentSelect={handleContentSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Cards View */}
        <TabsContent value="individual" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleCourses.map((course, index) => (
              <EnhancedCourseCard
                key={`${course.id}-${refreshKey}`}
                course={course}
                stats={index === 0 ? sampleStats : undefined}
                progress={index === 0 ? 75 : index === 2 ? 45 : undefined}
                variant="default"
                showActions={true}
                onCourseSelect={handleCourseSelect}
                onContentSelect={handleContentSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </TabsContent>

        {/* Card Variants View */}
        <TabsContent value="variants" className="space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <EnhancedCourseCard
                  course={sampleCourses[0]}
                  stats={sampleStats}
                  progress={75}
                  variant="default"
                  showActions={true}
                  onCourseSelect={handleCourseSelect}
                  onContentSelect={handleContentSelect}
                />
                <EnhancedCourseCard
                  course={sampleCourses[1]}
                  variant="default"
                  onCourseSelect={handleCourseSelect}
                  onContentSelect={handleContentSelect}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
              <div className="space-y-4">
                {sampleCourses.slice(0, 3).map((course) => (
                  <EnhancedCourseCard
                    key={course.id}
                    course={course}
                    variant="compact"
                    onCourseSelect={handleCourseSelect}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Variant</h3>
              <EnhancedCourseCard
                course={sampleCourses[2]}
                stats={sampleStats}
                progress={45}
                variant="detailed"
                showActions={true}
                onCourseSelect={handleCourseSelect}
                onContentSelect={handleContentSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Course Info */}
      {selectedCourse && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Selected Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Course ID: <code className="bg-muted px-2 py-1 rounded">{selectedCourse}</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
