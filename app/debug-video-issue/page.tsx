"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function DebugVideoIssuePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (result: any) => {
    setResults(prev => [...prev, { 
      timestamp: new Date().toLocaleTimeString(), 
      ...result 
    }])
  }

  const testDebugVideoApi = async () => {
    setLoading(true)
    try {
      addResult({ test: 'Debug Video API', status: 'Starting...' })
      
      const response = await fetch('/api/debug-video')
      const data = await response.json()
      
      addResult({ 
        test: 'Debug Video API', 
        status: response.status, 
        success: data.success,
        data 
      })
    } catch (error) {
      addResult({ 
        test: 'Debug Video API', 
        error: error.toString() 
      })
    }
    setLoading(false)
  }

  const testVideosList = async () => {
    setLoading(true)
    try {
      addResult({ test: 'Videos List', status: 'Starting...' })
      
      const response = await fetch('/api/videos-list')
      const data = await response.json()
      
      addResult({ 
        test: 'Videos List', 
        status: response.status, 
        count: data.count,
        data 
      })
    } catch (error) {
      addResult({ 
        test: 'Videos List', 
        error: error.toString() 
      })
    }
    setLoading(false)
  }

  const testSpecificVideo = async () => {
    setLoading(true)
    try {
      // First get list of videos to find a real ID
      const listResponse = await fetch('/api/videos-list')
      const listData = await listResponse.json()
      
      if (listData.videos && listData.videos.length > 0) {
        const firstVideo = listData.videos[0]
        const videoId = firstVideo.id
        
        addResult({ 
          test: 'Specific Video Test', 
          status: `Testing with real video ID: ${videoId}` 
        })
        
        // Test simplified API
        const simpleResponse = await fetch(`/api/videos-simple/${videoId}`)
        const simpleData = await simpleResponse.json()
        
        addResult({ 
          test: 'Specific Video (Simple API)', 
          status: simpleResponse.status, 
          data: simpleData 
        })
        
        // Test regular API
        const regularResponse = await fetch(`/api/videos/${videoId}`)
        const regularData = await regularResponse.json()
        
        addResult({ 
          test: 'Specific Video (Regular API)', 
          status: regularResponse.status, 
          data: regularData 
        })
        
      } else {
        addResult({ 
          test: 'Specific Video Test', 
          error: 'No videos found in database' 
        })
      }
    } catch (error) {
      addResult({ 
        test: 'Specific Video Test', 
        error: error.toString() 
      })
    }
    setLoading(false)
  }

  const testShareableUrl = async () => {
    setLoading(true)
    try {
      // Get a real video ID first
      const listResponse = await fetch('/api/videos-list')
      const listData = await listResponse.json()
      
      if (listData.videos && listData.videos.length > 0) {
        const firstVideo = listData.videos[0]
        const videoId = firstVideo.id
        const shareUrl = `${window.location.origin}/video/${videoId}`
        
        addResult({ 
          test: 'Shareable URL Test', 
          status: `Generated shareable URL: ${shareUrl}` 
        })
        
        // Open in new tab
        window.open(shareUrl, '_blank')
        
        addResult({ 
          test: 'Shareable URL Test', 
          status: 'Opened in new tab - check if it loads correctly' 
        })
        
      } else {
        addResult({ 
          test: 'Shareable URL Test', 
          error: 'No videos found to test with' 
        })
      }
    } catch (error) {
      addResult({ 
        test: 'Shareable URL Test', 
        error: error.toString() 
      })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Video 500 Error</h1>
      
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">🐛 Current Issue</h2>
          <p className="text-red-700 text-sm">
            Getting 500 Internal Server Error when selecting and sharing videos.
            This page will help identify the exact cause.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={testDebugVideoApi} disabled={loading} size="sm">
            1. Debug Video API
          </Button>
          <Button onClick={testVideosList} disabled={loading} size="sm">
            2. List Videos
          </Button>
          <Button onClick={testSpecificVideo} disabled={loading} size="sm">
            3. Test Specific Video
          </Button>
          <Button onClick={testShareableUrl} disabled={loading} size="sm">
            4. Test Shareable URL
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
          {loading && <span className="text-blue-600 text-sm">Testing...</span>}
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Results:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">No test results yet. Run tests above in order (1→2→3→4).</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{result.test}</span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.status && (
                    <div className={`text-sm mb-1 ${
                      typeof result.status === 'number' 
                        ? result.status === 200 ? 'text-green-600' : 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      Status: {result.status}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-red-600 text-sm mb-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.success !== undefined && (
                    <div className={`text-sm mb-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      Success: {result.success ? 'Yes' : 'No'}
                    </div>
                  )}
                  
                  {result.count !== undefined && (
                    <div className="text-sm mb-1 text-blue-600">
                      Count: {result.count}
                    </div>
                  )}
                  
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">View Data</summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debugging Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>Debug Video API:</strong> Tests basic Supabase connection and video table access</li>
            <li><strong>List Videos:</strong> Shows what videos exist in your database</li>
            <li><strong>Test Specific Video:</strong> Tests both simple and regular video APIs with real ID</li>
            <li><strong>Test Shareable URL:</strong> Opens a real shareable video URL in new tab</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
