"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { ContentViewer } from "@/components/content-viewer"
import { generateSimpleShareUrl, updateUrlWithoutNavigation } from "@/lib/simple-share-utils"

interface ContentItem {
  id: string
  type: "slide" | "video" | "document" | "syllabus"
  title: string
  url: string
  topicTitle?: string
  courseTitle?: string
  description?: string
}

export default function TestContentSelectionPage() {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [selectionLog, setSelectionLog] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setSelectionLog(prev => [...prev, `${timestamp}: ${message}`])
    console.log(message)
  }

  const handleContentSelect = async (content: ContentItem) => {
    addLog("=== CONTENT SELECTION STARTED ===")
    addLog(`Selected: ${content.title} (${content.type})`)
    addLog(`ID: ${content.id}`)
    
    try {
      // Set the selected content
      addLog("Setting selected content...")
      setSelectedContent(content)
      
      // Generate shareable URL
      const contentType = content.type === "document" ? "slide" :
                         content.type === "syllabus" ? "study-tool" : content.type
      const shareUrl = generateSimpleShareUrl(contentType, content.id)
      
      addLog(`Generated share URL: ${shareUrl}`)
      
      // Update URL
      addLog("Updating browser URL...")
      updateUrlWithoutNavigation(shareUrl)
      
      addLog("✅ Content selection completed successfully!")
      
    } catch (error) {
      addLog(`❌ Error during content selection: ${error}`)
    }
  }

  const clearLog = () => {
    setSelectionLog([])
  }

  const testDirectUrl = () => {
    const currentUrl = window.location.href
    addLog(`Current URL: ${currentUrl}`)
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(currentUrl).then(() => {
      addLog("✅ Current URL copied to clipboard - test by opening in new tab")
    }).catch(() => {
      addLog("❌ Failed to copy URL to clipboard")
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Test Content Selection</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Course Content</h2>
            <div className="h-96 overflow-y-auto">
              <FunctionalSidebar
                onContentSelect={handleContentSelect}
                selectedContentId={selectedContent?.id}
              />
            </div>
          </div>
          
          {/* Content Viewer */}
          <div className="lg:col-span-1 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Content Viewer</h2>
            {selectedContent ? (
              <div className="space-y-4">
                <div className="aspect-video">
                  <ContentViewer 
                    content={selectedContent} 
                    isLoading={false} 
                  />
                </div>
                <div className="text-sm">
                  <p><strong>Title:</strong> {selectedContent.title}</p>
                  <p><strong>Type:</strong> {selectedContent.type}</p>
                  <p><strong>ID:</strong> {selectedContent.id}</p>
                  {selectedContent.courseTitle && (
                    <p><strong>Course:</strong> {selectedContent.courseTitle}</p>
                  )}
                  {selectedContent.topicTitle && (
                    <p><strong>Topic:</strong> {selectedContent.topicTitle}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Select content from the sidebar to view it here</p>
              </div>
            )}
          </div>
          
          {/* Debug Log */}
          <div className="lg:col-span-1 border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Selection Log</h2>
              <div className="space-x-2">
                <Button onClick={testDirectUrl} size="sm" variant="outline">
                  Test Current URL
                </Button>
                <Button onClick={clearLog} size="sm" variant="outline">
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto bg-gray-50 p-2 rounded text-xs font-mono">
              {selectionLog.length === 0 ? (
                <p className="text-gray-500">No selections yet. Click on content in the sidebar.</p>
              ) : (
                selectionLog.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click on any content item in the Course Content sidebar</li>
            <li>Watch the Selection Log to see what happens</li>
            <li>Check if the content appears in the Content Viewer</li>
            <li>Click "Test Current URL" to copy the shareable URL</li>
            <li>Open the copied URL in a new tab to test sharing</li>
          </ol>
        </div>
        
        <div className="mt-4">
          <Button onClick={() => window.location.href = '/'}>
            Back to Main Page
          </Button>
        </div>
      </div>
    </div>
  )
}
