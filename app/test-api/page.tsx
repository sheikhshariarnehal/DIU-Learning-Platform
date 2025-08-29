"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestApiPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (result: any) => {
    setResults(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), ...result }])
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-connection')
      const data = await response.json()
      addResult({ test: 'Connection Test', status: response.status, data })
    } catch (error) {
      addResult({ test: 'Connection Test', error: error.toString() })
    }
    setLoading(false)
  }

  const testSlideApi = async () => {
    setLoading(true)
    const testId = "13e67327-db36-410a-b560-f45618d38929"
    try {
      const response = await fetch(`/api/slides-simple/${testId}`)
      const data = await response.json()
      addResult({ test: 'Slide API Test (Simple)', status: response.status, data })
    } catch (error) {
      addResult({ test: 'Slide API Test (Simple)', error: error.toString() })
    }
    setLoading(false)
  }

  const testVideoApi = async () => {
    setLoading(true)
    const testId = "test-video-123" // You can change this to a real video ID
    try {
      const response = await fetch(`/api/videos-simple/${testId}`)
      const data = await response.json()
      addResult({ test: 'Video API Test (Simple)', status: response.status, data })
    } catch (error) {
      addResult({ test: 'Video API Test (Simple)', error: error.toString() })
    }
    setLoading(false)
  }

  const testSimpleApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-simple')
      const data = await response.json()
      addResult({ test: 'Simple API Test', status: response.status, data })
    } catch (error) {
      addResult({ test: 'Simple API Test', error: error.toString() })
    }
    setLoading(false)
  }

  const testAllSlides = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/slides-list')
      const data = await response.json()
      addResult({ test: 'List All Slides', status: response.status, data })
    } catch (error) {
      addResult({ test: 'List All Slides', error: error.toString() })
    }
    setLoading(false)
  }

  const testAllVideos = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/videos-list')
      const data = await response.json()
      addResult({ test: 'List All Videos', status: response.status, data })
    } catch (error) {
      addResult({ test: 'List All Videos', error: error.toString() })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <div className="space-x-2">
          <Button onClick={testSimpleApi} disabled={loading}>
            Test Simple API
          </Button>
          <Button onClick={testConnection} disabled={loading}>
            Test Supabase Connection
          </Button>
          <Button onClick={testSlideApi} disabled={loading}>
            Test Slide API (Simple)
          </Button>
          <Button onClick={testVideoApi} disabled={loading}>
            Test Video API (Simple)
          </Button>
          <Button onClick={testAllSlides} disabled={loading}>
            List All Slides
          </Button>
          <Button onClick={testAllVideos} disabled={loading}>
            List All Videos
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
        
        {loading && <p className="text-blue-600">Testing...</p>}
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">No test results yet. Click a test button above.</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="font-semibold text-sm text-gray-600 mb-1">
                  {result.timestamp} - {result.test}
                </div>
                {result.status && (
                  <div className={`text-sm mb-2 ${result.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {result.status}
                  </div>
                )}
                {result.error && (
                  <div className="text-red-600 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}
                {result.data && (
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
