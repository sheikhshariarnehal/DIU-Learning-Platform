"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestAllApisPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (result: any) => {
    setResults(prev => [...prev, { 
      timestamp: new Date().toLocaleTimeString(), 
      ...result 
    }])
  }

  const testApi = async (type: string, endpoint: string) => {
    setLoading(true)
    try {
      addResult({ test: `${type} List`, status: 'Starting...' })
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      addResult({ 
        test: `${type} List`, 
        status: response.status, 
        success: response.ok,
        count: data.count || data.slides?.length || data.videos?.length || data.studyTools?.length || 0,
        data 
      })
      
      // Test with first item if available
      const items = data.slides || data.videos || data.studyTools || []
      if (items.length > 0) {
        const firstItem = items[0]
        const apiType = type.toLowerCase().replace(' ', '-')
        const testEndpoint = `/api/${apiType}s-simple/${firstItem.id}`
        
        addResult({ test: `${type} Single`, status: `Testing ${testEndpoint}` })
        
        const singleResponse = await fetch(testEndpoint)
        const singleData = await singleResponse.json()
        
        addResult({ 
          test: `${type} Single`, 
          status: singleResponse.status, 
          success: singleResponse.ok,
          itemId: firstItem.id,
          data: singleData 
        })
      }
    } catch (error) {
      addResult({ 
        test: `${type} API`, 
        error: error.toString() 
      })
    }
    setLoading(false)
  }

  const testSlides = () => testApi('Slide', '/api/slides-list')
  const testVideos = () => testApi('Video', '/api/videos-list')
  const testStudyTools = () => testApi('Study Tool', '/api/study-tools-list')

  const testSpecificIds = async () => {
    setLoading(true)
    
    // Test with some common test IDs
    const testIds = [
      'test-slide-123',
      'test-video-456', 
      'test-study-789'
    ]
    
    for (const testId of testIds) {
      for (const apiType of ['slides', 'videos', 'study-tools']) {
        try {
          const endpoint = `/api/${apiType}-simple/${testId}`
          addResult({ test: `Test ID ${testId}`, status: `Testing ${endpoint}` })
          
          const response = await fetch(endpoint)
          const data = await response.json()
          
          addResult({ 
            test: `Test ID ${testId}`, 
            api: apiType,
            status: response.status, 
            success: response.ok,
            data 
          })
        } catch (error) {
          addResult({ 
            test: `Test ID ${testId}`, 
            api: apiType,
            error: error.toString() 
          })
        }
      }
    }
    
    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test All APIs - Same Pattern as Slides</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">🔍 Testing Strategy</h2>
          <p className="text-blue-700 text-sm">
            Testing videos and study tools APIs using the exact same pattern as the working slides API.
            All APIs should return the same response format and handle errors identically.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button onClick={testSlides} disabled={loading} size="sm">
            Test Slides (Working)
          </Button>
          <Button onClick={testVideos} disabled={loading} size="sm">
            Test Videos
          </Button>
          <Button onClick={testStudyTools} disabled={loading} size="sm">
            Test Study Tools
          </Button>
          <Button onClick={testSpecificIds} disabled={loading} size="sm">
            Test Specific IDs
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
              <p className="text-gray-500 text-sm">No test results yet. Click test buttons above.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{result.test}</span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {result.api && (
                    <div className="text-sm mb-1 text-purple-600">
                      API: {result.api}
                    </div>
                  )}
                  
                  {result.status && (
                    <div className={`text-sm mb-1 ${
                      typeof result.status === 'number' 
                        ? result.status === 200 ? 'text-green-600' : result.status === 404 ? 'text-yellow-600' : 'text-red-600'
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
                  
                  {result.itemId && (
                    <div className="text-sm mb-1 text-gray-600">
                      Item ID: {result.itemId}
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
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Results:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Slides:</strong> Should work (reference implementation)</li>
            <li><strong>Videos:</strong> Should return same format as slides</li>
            <li><strong>Study Tools:</strong> Should return same format as slides</li>
            <li><strong>All APIs:</strong> Same error handling (404 for not found, 500 for errors)</li>
            <li><strong>Response Format:</strong> {`{id, title, url, description, type}`}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
