"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { bulkImportData, type BulkImportData } from "@/lib/supabase"
import { Upload, CheckCircle, XCircle, Info, Database } from "lucide-react"
import { toast } from "sonner"

const sampleData = {
  semesters: [
    {
      name: "Midterm",
      courses: [
        {
          name: "Information Security (CSE423)",
          studyTools: ["Previous Questions", "Exam Notes", "Syllabus for Exam", "Mark Distribution"],
          topics: [
            {
              title: "Information Security and its Elements",
              slide: "https://example.com/slides/info-security-elements.pdf",
              video: "https://www.youtube.com/watch?v=example1",
            },
            {
              title: "Cryptography Fundamentals",
              slide: "https://example.com/slides/crypto-fundamentals.pdf",
              video: "https://www.youtube.com/watch?v=example2",
            },
          ],
        },
        {
          name: "Database Management (CSE311)",
          studyTools: ["Previous Questions", "Lab Manual", "Project Guidelines"],
          topics: [
            {
              title: "Database Design Principles",
              slide: "https://example.com/slides/db-design.pdf",
              video: "https://www.youtube.com/watch?v=example3",
            },
          ],
        },
      ],
    },
    {
      name: "Final",
      courses: [
        {
          name: "Software Engineering (CSE412)",
          studyTools: ["Previous Questions", "Case Studies", "Project Templates"],
          topics: [
            {
              title: "Software Development Life Cycle",
              slide: "https://example.com/slides/sdlc.pdf",
              video: "https://www.youtube.com/watch?v=example4",
            },
          ],
        },
      ],
    },
  ],
}

export function BulkImportDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateJson = (jsonString: string): BulkImportData | null => {
    try {
      const parsed = JSON.parse(jsonString)

      // Basic structure validation
      if (!parsed.semesters || !Array.isArray(parsed.semesters)) {
        throw new Error("JSON must have a 'semesters' array")
      }

      for (const semester of parsed.semesters) {
        if (!semester.name || typeof semester.name !== "string") {
          throw new Error("Each semester must have a 'name' string")
        }
        if (!semester.courses || !Array.isArray(semester.courses)) {
          throw new Error("Each semester must have a 'courses' array")
        }

        for (const course of semester.courses) {
          if (!course.name || typeof course.name !== "string") {
            throw new Error("Each course must have a 'name' string")
          }
          if (course.studyTools && !Array.isArray(course.studyTools)) {
            throw new Error("Course 'studyTools' must be an array if provided")
          }
          if (course.topics && !Array.isArray(course.topics)) {
            throw new Error("Course 'topics' must be an array if provided")
          }

          if (course.topics) {
            for (const topic of course.topics) {
              if (!topic.title || typeof topic.title !== "string") {
                throw new Error("Each topic must have a 'title' string")
              }
            }
          }
        }
      }

      setValidationError(null)
      return parsed as BulkImportData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON format"
      setValidationError(errorMessage)
      return null
    }
  }

  const handleImport = async () => {
    const validatedData = validateJson(jsonInput)
    if (!validatedData) {
      toast.error("Please fix the JSON validation errors before importing")
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const result = await bulkImportData(validatedData)
      setImportResult(result)

      if (result.success) {
        toast.success("Data imported successfully!")
        setTimeout(() => {
          setIsOpen(false)
          window.location.reload() // Refresh to show new data
        }, 2000)
      } else {
        toast.error("Import failed. Please check the details.")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setImportResult({
        success: false,
        message: errorMessage,
      })
      toast.error("Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setValidationError(null)
    }
  }

  const loadSampleData = () => {
    const sampleJson = JSON.stringify(sampleData, null, 2)
    setJsonInput(sampleJson)
    validateJson(sampleJson)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 bg-transparent"
        >
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Bulk Import Data
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Import semesters, courses, study tools, and topics from JSON data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Info className="h-4 w-4" />
            <AlertTitle>Import Instructions</AlertTitle>
            <AlertDescription>
              Paste your JSON data below or use the sample data to get started. The system will create all hierarchical
              relationships automatically.
            </AlertDescription>
          </Alert>

          {/* JSON Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-input">JSON Data</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadSampleData}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Load Sample Data
              </Button>
            </div>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="min-h-[300px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
              placeholder="Paste your JSON data here..."
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{importResult.success ? "Import Successful" : "Import Failed"}</AlertTitle>
              <AlertDescription>
                {importResult.message}
                {importResult.details && (
                  <div className="mt-2 text-sm">
                    <p>Created:</p>
                    <ul className="list-disc list-inside ml-4">
                      <li>{importResult.details.semesters} semesters</li>
                      <li>{importResult.details.courses} courses</li>
                      <li>{importResult.details.sections} sections</li>
                      <li>{importResult.details.studyTools} study tools</li>
                      <li>{importResult.details.topics} topics</li>
                      <li>{importResult.details.slides} slides</li>
                      <li>{importResult.details.videos} videos</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Sample Data Structure */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-sm">Expected JSON Structure</CardTitle>
              <CardDescription>Your JSON should follow this structure:</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-slate-300 overflow-x-auto">
                {`{
  "semesters": [
    {
      "name": "Midterm",
      "courses": [
        {
          "name": "Information Security (CSE423)",
          "studyTools": ["Previous Questions", "Exam Notes"],
          "topics": [
            {
              "title": "Topic Title",
              "slide": "https://example.com/slide.pdf",
              "video": "https://youtube.com/watch?v=..."
            }
          ]
        }
      ]
    }
  ]
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isImporting || !!validationError || !jsonInput.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isImporting ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
