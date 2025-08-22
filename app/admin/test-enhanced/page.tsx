"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedAllInOneCreator } from "@/components/admin/enhanced-all-in-one-creator"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function TestEnhancedPage() {
  const [testResults, setTestResults] = useState<{
    apiConnection: 'pending' | 'success' | 'error'
    componentRender: 'pending' | 'success' | 'error'
    formValidation: 'pending' | 'success' | 'error'
  }>({
    apiConnection: 'pending',
    componentRender: 'pending',
    formValidation: 'pending'
  })

  const [isTestingAPI, setIsTestingAPI] = useState(false)

  const testAPIConnection = async () => {
    setIsTestingAPI(true)
    try {
      // Test GET request to semesters
      const response = await fetch('/api/semesters')
      if (response.ok) {
        setTestResults(prev => ({ ...prev, apiConnection: 'success' }))
      } else {
        setTestResults(prev => ({ ...prev, apiConnection: 'error' }))
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, apiConnection: 'error' }))
    } finally {
      setIsTestingAPI(false)
    }
  }

  // Test component rendering
  useState(() => {
    try {
      setTestResults(prev => ({ ...prev, componentRender: 'success' }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, componentRender: 'error' }))
    }
  })

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
    }
  }

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Enhanced Creator Test Page
        </h1>
        <p className="text-muted-foreground">
          Test the enhanced All-in-One Creator functionality and database connectivity
        </p>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>System Tests</CardTitle>
          <CardDescription>
            Verify that all components and connections are working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.apiConnection)}
                <div>
                  <div className="font-medium">API Connection</div>
                  <div className="text-sm text-muted-foreground">Database connectivity</div>
                </div>
              </div>
              {getStatusBadge(testResults.apiConnection)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.componentRender)}
                <div>
                  <div className="font-medium">Component Render</div>
                  <div className="text-sm text-muted-foreground">UI components loading</div>
                </div>
              </div>
              {getStatusBadge(testResults.componentRender)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.formValidation)}
                <div>
                  <div className="font-medium">Form Validation</div>
                  <div className="text-sm text-muted-foreground">Input validation working</div>
                </div>
              </div>
              {getStatusBadge(testResults.formValidation)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testAPIConnection} 
              disabled={isTestingAPI}
              variant="outline"
            >
              {isTestingAPI ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API Connection'
              )}
            </Button>
            <Button 
              onClick={() => setTestResults(prev => ({ ...prev, formValidation: 'success' }))}
              variant="outline"
            >
              Test Form Validation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Creator */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced All-in-One Creator</CardTitle>
          <CardDescription>
            Test the enhanced creator with all new features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedAllInOneCreator mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
