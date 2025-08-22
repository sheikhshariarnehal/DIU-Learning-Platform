"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestEditPage() {
  const [semesterId, setSemesterId] = useState("")
  const [testResult, setTestResult] = useState<string | null>(null)

  const testEditLoad = async () => {
    if (!semesterId.trim()) {
      setTestResult("Please enter a semester ID")
      return
    }

    try {
      const response = await fetch(`/api/admin/all-in-one/${semesterId}`)
      const data = await response.json()

      if (response.ok) {
        setTestResult(`✅ Success! Loaded semester: "${data.semester?.title}" with ${data.courses?.length || 0} courses`)
      } else {
        setTestResult(`❌ Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const openEditPage = () => {
    if (!semesterId.trim()) {
      alert("Please enter a semester ID")
      return
    }
    window.open(`/admin/enhanced-creator/edit/${semesterId}`, '_blank')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Test Enhanced Creator Edit Mode</h1>
        <p className="text-muted-foreground">
          Test loading specific semester data in edit mode
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Semester Edit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="semesterId">Semester ID</Label>
            <Input
              id="semesterId"
              placeholder="Enter semester ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={testEditLoad} className="w-full">
              Test API Load
            </Button>
            
            <Button onClick={openEditPage} variant="outline" className="w-full">
              Open Edit Page
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-sm ${
              testResult.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={() => window.open('/admin/enhanced-creator', '_blank')}
            className="w-full"
          >
            Create New Semester
          </Button>
          
          <Button 
            onClick={() => window.open('/admin/test-db', '_blank')}
            variant="outline"
            className="w-full"
          >
            Database Test Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
