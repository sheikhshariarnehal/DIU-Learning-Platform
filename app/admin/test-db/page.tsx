"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Database } from "lucide-react"

interface Semester {
  id: string
  title: string
  section: string
  created_at: string
}

export default function TestDBPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{
    connection: boolean
    semesters: boolean
    api: boolean
  }>({
    connection: false,
    semesters: false,
    api: false
  })

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Test basic API connection
      const response = await fetch('/api/semesters')
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      setSemesters(data.data || [])
      
      setTestResults({
        connection: true,
        semesters: Array.isArray(data.data),
        api: response.ok
      })
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setTestResults({
        connection: false,
        semesters: false,
        api: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testSpecificSemester = async (semesterId: string) => {
    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`)
      const data = await response.json()
      
      if (response.ok) {
        alert(`✅ Semester data loaded successfully!\n\nTitle: ${data.semester?.title}\nCourses: ${data.courses?.length || 0}`)
      } else {
        alert(`❌ Error loading semester: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert(`❌ Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Database className="h-8 w-8" />
          Database Connection Test
        </h1>
        <p className="text-muted-foreground">
          Test database connectivity and Enhanced Creator data loading
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              {testResults.connection ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Database Connection</span>
            </div>
            
            <div className="flex items-center gap-2">
              {testResults.api ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>API Response</span>
            </div>
            
            <div className="flex items-center gap-2">
              {testResults.semesters ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Semesters Table</span>
            </div>
          </div>

          <Button 
            onClick={testDatabaseConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Retest Connection"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Semesters */}
      <Card>
        <CardHeader>
          <CardTitle>Available Semesters ({semesters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {semesters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No semesters found in database</p>
              <p className="text-sm mt-2">
                Create a semester first using the Enhanced Creator
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {semesters.map((semester) => (
                <div 
                  key={semester.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{semester.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Section: {semester.section} • ID: {semester.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {new Date(semester.created_at).toLocaleDateString()}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => testSpecificSemester(semester.id)}
                    >
                      Test Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/admin/enhanced-creator/edit/${semester.id}`, '_blank')}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => window.open('/admin/enhanced-creator', '_blank')}
            className="w-full"
          >
            Create New Semester
          </Button>
          
          <Button 
            onClick={() => window.open('/admin/semesters', '_blank')}
            variant="outline"
            className="w-full"
          >
            View All Semesters
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
