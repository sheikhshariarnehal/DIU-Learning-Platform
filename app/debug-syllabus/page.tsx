"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DebugSyllabusPage() {
  const [studyTools, setStudyTools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudyTools = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('study_tools')
        .select('*')
        .eq('type', 'syllabus')
        .limit(10)

      if (error) throw error
      
      console.log("Fetched study tools:", data)
      setStudyTools(data || [])
    } catch (err) {
      console.error("Error fetching study tools:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const testSyllabusCreation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // First, get a course ID
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .limit(1)

      if (coursesError) throw coursesError
      if (!courses || courses.length === 0) {
        throw new Error('No courses found. Please create a course first.')
      }

      const courseId = courses[0].id

      // Try to create a test syllabus
      const testSyllabus = {
        title: "Test Syllabus " + Date.now(),
        type: "syllabus",
        description: `# Test Course Syllabus

## Course Overview
This is a test syllabus created to verify the description field functionality.

## Learning Objectives
- Test objective 1
- Test objective 2
- Test objective 3

## Assessment
- Midterm: 30%
- Final: 40%
- Assignments: 30%`,
        course_id: courseId,
        exam_type: "both",
        content_url: null
      }

      const { data, error } = await supabase
        .from('study_tools')
        .insert([testSyllabus])
        .select()

      if (error) throw error

      console.log("Created test syllabus:", data)
      await fetchStudyTools()
    } catch (err) {
      console.error("Error creating test syllabus:", err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudyTools()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Syllabus Debug Page</h1>
        <p className="text-muted-foreground">
          Debug and test syllabus functionality
        </p>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Actions</CardTitle>
          <CardDescription>Test syllabus functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={fetchStudyTools} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh Study Tools
            </Button>
            <Button onClick={testSyllabusCreation} disabled={isLoading} variant="outline">
              Create Test Syllabus
            </Button>
            <Button
              onClick={async () => {
                setIsLoading(true)
                setError(null)
                try {
                  const response = await fetch('/api/admin/fix-syllabus', { method: 'POST' })
                  const result = await response.json()

                  if (result.success) {
                    console.log("Fix result:", result)
                    await fetchStudyTools()
                  } else {
                    setError(result.message)
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Unknown error')
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
              variant="secondary"
            >
              Fix Existing Syllabus
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Tools List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Syllabus Study Tools ({studyTools.length})
          </CardTitle>
          <CardDescription>All syllabus-type study tools in the database</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : studyTools.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No syllabus study tools found</p>
              <p className="text-sm text-gray-400 mt-2">Try creating a test syllabus above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studyTools.map((tool, index) => (
                <div key={tool.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{tool.title}</h3>
                    <Badge variant="outline">
                      {tool.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {tool.id}
                    </div>
                    <div>
                      <span className="font-medium">Course ID:</span> {tool.course_id}
                    </div>
                    <div>
                      <span className="font-medium">Content URL:</span> {tool.content_url || 'NULL'}
                    </div>
                    <div>
                      <span className="font-medium">Exam Type:</span> {tool.exam_type}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Description:</span>
                      {tool.description ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {tool.description ? (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {tool.description}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No description available</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Raw Data:</h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(tool, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Run Database Migration</h4>
            <p className="text-sm text-muted-foreground">
              Execute the SQL script in <code>scripts/add-description-column.sql</code>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. Test Syllabus Creation</h4>
            <p className="text-sm text-muted-foreground">
              Click "Create Test Syllabus" to verify the description field works
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">3. Check User Interface</h4>
            <p className="text-sm text-muted-foreground">
              Go to the main app and try clicking on a syllabus study tool
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
