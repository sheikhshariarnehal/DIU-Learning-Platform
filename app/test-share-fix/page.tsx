"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateSimpleShareUrl } from "@/lib/simple-share-utils"

export default function TestShareFixPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testShareableUrls = [
    { type: 'slide', id: 'test-slide-123', label: 'Test Slide' },
    { type: 'video', id: 'test-video-456', label: 'Test Video' },
    { type: 'study-tool', id: 'test-study-789', label: 'Test Study Tool' }
  ]

  const testShareUrl = (type: string, id: string, label: string) => {
    const shareUrl = generateSimpleShareUrl(type, id)
    addResult(`Testing ${label}: ${shareUrl}`)
    
    // Open in new tab to test
    window.open(shareUrl, '_blank')
  }

  const testCurrentPage = () => {
    const currentUrl = window.location.href
    addResult(`Current page URL: ${currentUrl}`)
    
    // Test if current page would be detected as shareable
    const hasShareablePattern = /\/(video|slide|study-tool)\/[a-f0-9-]{36}/i.test(currentUrl)
    addResult(`Has shareable pattern: ${hasShareablePattern}`)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Share Fix</h1>
      
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Issue Fixed!</h2>
          <p className="text-green-700 text-sm">
            The conflict between shareable URL loading and default content loading has been resolved.
            Now when you share a file link, it should load the specific file instead of the default first file.
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Shareable URLs:</h2>
          <div className="grid gap-3">
            {testShareableUrls.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.type}/{item.id})</span>
                </div>
                <Button 
                  onClick={() => testShareUrl(item.type, item.id, item.label)}
                  size="sm"
                >
                  Test Share
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-x-2">
          <Button onClick={testCurrentPage}>Test Current Page</Button>
          <Button onClick={clearResults} variant="outline">Clear Results</Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No test results yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Test Share" on any item above</li>
            <li>It should open a new tab with the main page</li>
            <li>The specific content should load (not the default first file)</li>
            <li>Check the browser console for detailed logs</li>
            <li>Try with real slide IDs from <code>/browse-slides</code></li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Before fix:</strong> Shareable URLs loaded default first file</li>
            <li><strong>After fix:</strong> Shareable URLs load the specific requested file</li>
            <li><strong>Main page:</strong> Still loads default/highlighted content when accessed directly</li>
            <li><strong>Console logs:</strong> Show "Skipping default content load" for shareable URLs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
