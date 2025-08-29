"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { generateSimpleShareUrl } from "@/lib/simple-share-utils"

interface StudyTool {
  id: string
  title: string
  google_drive_url: string
  description?: string
  study_tool_type: string
  topic?: {
    id: string
    title: string
    course?: {
      id: string
      title: string
    }
  }
}

export default function BrowseStudyToolsPage() {
  const [studyTools, setStudyTools] = useState<StudyTool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudyTools = async () => {
      try {
        const response = await fetch('/api/study-tools-list')
        const data = await response.json()
        
        if (response.ok) {
          setStudyTools(data.studyTools || [])
        } else {
          setError(data.error || 'Failed to fetch study tools')
        }
      } catch (err) {
        setError('Network error: ' + err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudyTools()
  }, [])

  const testStudyTool = (studyToolId: string) => {
    const shareUrl = generateSimpleShareUrl('study-tool', studyToolId)
    window.open(shareUrl, '_blank')
  }

  const copyShareUrl = async (studyToolId: string) => {
    const shareUrl = generateSimpleShareUrl('study-tool', studyToolId)
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Share URL copied to clipboard!')
    } catch (err) {
      alert('Failed to copy URL')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Available Study Tools</h1>
        <p>Loading study tools...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Browse Available Study Tools</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Browse Available Study Tools</h1>
      
      <p className="mb-6 text-gray-600">
        Found {studyTools.length} study tools in the database. Click "Test Share" to test the sharing functionality.
      </p>
      
      {studyTools.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>No study tools found.</strong> Make sure you have study tools in your database.
        </div>
      ) : (
        <div className="grid gap-4">
          {studyTools.map((studyTool) => (
            <div key={studyTool.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{studyTool.title}</h3>
                  {studyTool.description && (
                    <p className="text-gray-600 mb-2">{studyTool.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mb-2">Type: {studyTool.study_tool_type}</p>
                  {studyTool.topic && (
                    <div className="text-sm text-gray-500">
                      <p>Topic: {studyTool.topic.title}</p>
                      {studyTool.topic.course && (
                        <p>Course: {studyTool.topic.course.title}</p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">ID: {studyTool.id}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    onClick={() => testStudyTool(studyTool.id)}
                    size="sm"
                  >
                    Test Share
                  </Button>
                  <Button 
                    onClick={() => copyShareUrl(studyTool.id)}
                    variant="outline"
                    size="sm"
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test Share" on any study tool above</li>
          <li>It should open the main page with that study tool loaded</li>
          <li>The URL should be shareable (copy and test in new tab)</li>
          <li>Or click "Copy URL" to get the shareable link directly</li>
        </ol>
      </div>
      
      <div className="mt-4">
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Main Page
        </Button>
      </div>
    </div>
  )
}
