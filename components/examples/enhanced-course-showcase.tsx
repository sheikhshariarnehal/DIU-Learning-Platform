"use client"

import { useState } from "react"
import { EnhancedCourseCard } from "@/components/ui/enhanced-course-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, BookOpen, Users, Clock, TrendingUp } from "lucide-react"

interface EnhancedCourseShowcaseProps {
  courses?: any[]
  className?: string
}

export function EnhancedCourseShowcase({ courses = [], className }: EnhancedCourseShowcaseProps) {
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")

  // Sample data if no courses provided
  const sampleCourses = courses.length > 0 ? courses : [
    {
      id: "sample-1",
      title: "Advanced Web Development",
      course_code: "WEB-401",
      teacher_name: "Dr. Sarah Johnson",
      teacher_email: "sarah@university.edu",
      description: "Master modern web development with React, Next.js, and TypeScript",
      credits: 4,
      is_highlighted: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      semester: {
        id: "sem1",
        title: "Spring 2024",
        section: "A",
        is_active: true
      }
    },
    {
      id: "sample-2",
      title: "Database Design",
      course_code: "DB-302",
      teacher_name: "Prof. Michael Chen",
      teacher_email: "michael@university.edu",
      description: "Learn database design principles and SQL optimization",
      credits: 3,
      is_highlighted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      semester: {
        id: "sem1",
        title: "Spring 2024",
        section: "B",
        is_active: true
      }
    }
  ]

  const handleCourseSelect = (courseId: string) => {
    console.log("Course selected:", courseId)
  }

  const handleContentSelect = (content: any) => {
    console.log("Content selected:", content)
  }

  return (
    <div className={className}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Enhanced Course Cards</h2>
            <p className="text-muted-foreground">
              Professional, functional, and responsive course card components
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Enhanced
            </Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Interactive Design</p>
                  <p className="text-xs text-muted-foreground">Hover effects & animations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Mobile Optimized</p>
                  <p className="text-xs text-muted-foreground">Touch-friendly interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Loading States</p>
                  <p className="text-xs text-muted-foreground">Smooth data fetching</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Cards Showcase */}
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as "grid" | "list")}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            {sampleCourses.length} course{sampleCourses.length !== 1 ? 's' : ''} available
          </div>
        </div>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleCourses.map((course, index) => (
              <EnhancedCourseCard
                key={course.id}
                course={course}
                stats={index === 0 ? {
                  totalTopics: 8,
                  totalVideos: 24,
                  totalSlides: 156,
                  totalStudyTools: 12,
                  completedItems: 18,
                  enrolledStudents: 89
                } : undefined}
                progress={index === 0 ? 75 : index === 1 ? 45 : undefined}
                variant="default"
                showActions={true}
                onCourseSelect={handleCourseSelect}
                onContentSelect={handleContentSelect}
                onEdit={(id) => console.log("Edit:", id)}
                onDelete={(id) => console.log("Delete:", id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {sampleCourses.map((course) => (
            <EnhancedCourseCard
              key={course.id}
              course={course}
              variant="compact"
              onCourseSelect={handleCourseSelect}
              className="w-full"
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Integration Example */}
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Integration Example</CardTitle>
          <CardDescription>
            How to use the enhanced course cards in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
              <code>{`import { EnhancedCourseCard } from "@/components/ui/enhanced-course-card"

<EnhancedCourseCard
  course={courseData}
  stats={courseStats}
  progress={completionPercentage}
  variant="default"
  showActions={true}
  onCourseSelect={handleCourseSelect}
  onContentSelect={handleContentSelect}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
