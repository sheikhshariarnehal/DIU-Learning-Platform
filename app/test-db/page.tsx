"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestDatabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDescriptionColumn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-description')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test database',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testDescriptionColumn()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Database Column Test</h1>
        <p className="text-muted-foreground">
          Testing if the description column exists in the study_tools table
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : testResult?.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Description Column Test
          </CardTitle>
          <CardDescription>
            Checking if the study_tools table has the description column
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Testing database...</span>
            </div>
          ) : testResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "SUCCESS" : "FAILED"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Column exists: {testResult.columnExists ? "Yes" : "No"}
                </span>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Result:</h4>
                <p className="text-sm">{testResult.message}</p>
                {testResult.error && (
                  <p className="text-sm text-red-600 mt-2">Error: {testResult.error}</p>
                )}
              </div>

              {testResult.sampleData && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Sample Data:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testResult.sampleData, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={testDescriptionColumn} className="flex-1">
                  Test Again
                </Button>
                {!testResult.success && (
                  <Button
                    onClick={async () => {
                      setIsLoading(true)
                      try {
                        const response = await fetch('/api/admin/migrate-description', { method: 'POST' })
                        const result = await response.json()
                        if (result.success) {
                          await testDescriptionColumn()
                        } else {
                          setTestResult(result)
                        }
                      } catch (error) {
                        setTestResult({
                          success: false,
                          message: 'Migration failed',
                          error: error instanceof Error ? error.message : 'Unknown error'
                        })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Migration
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p>No test results yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {testResult && !testResult.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Migration Required</CardTitle>
            <CardDescription>
              The description column is missing from the study_tools table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                To fix this issue, you need to run the following SQL command on your database:
              </p>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-sm">
                  ALTER TABLE study_tools ADD COLUMN description TEXT;
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                After running this command, refresh this page to test again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
