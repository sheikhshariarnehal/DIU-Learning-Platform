"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { parseSimpleShareUrl } from "@/lib/simple-share-utils"

export default function DebugSharePage() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [testId, setTestId] = useState("13e67327-db36-410a-b560-f45618d38929")

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const testUrlParsing = () => {
    const testUrl = `http://localhost:3000/slide/${testId}`
    addDebugInfo(`Testing URL: ${testUrl}`)
    
    const parsed = parseSimpleShareUrl(testUrl)
    addDebugInfo(`Parsed result: ${JSON.stringify(parsed)}`)
  }

  const testApiCall = async () => {
    try {
      addDebugInfo(`Testing API call for slide ID: ${testId}`)
      
      const apiEndpoint = `/api/slides/${testId}`
      addDebugInfo(`API Endpoint: ${apiEndpoint}`)
      
      const response = await fetch(apiEndpoint)
      addDebugInfo(`Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addDebugInfo(`API Success: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        addDebugInfo(`API Error: ${errorText}`)
      }
    } catch (error) {
      addDebugInfo(`Fetch Error: ${error}`)
    }
  }

  const testCurrentUrl = () => {
    const currentUrl = window.location.href
    addDebugInfo(`Current URL: ${currentUrl}`)
    
    const parsed = parseSimpleShareUrl(currentUrl)
    addDebugInfo(`Current URL parsed: ${JSON.stringify(parsed)}`)
  }

  const clearDebug = () => {
    setDebugInfo([])
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Share Functionality</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Test Slide ID:</label>
          <input 
            type="text" 
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter slide ID to test"
          />
        </div>
        
        <div className="space-x-2">
          <Button onClick={testUrlParsing}>Test URL Parsing</Button>
          <Button onClick={testApiCall}>Test API Call</Button>
          <Button onClick={testCurrentUrl}>Test Current URL</Button>
          <Button onClick={clearDebug} variant="outline">Clear Debug</Button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Output:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {debugInfo.length === 0 ? (
            <p className="text-gray-500">No debug information yet. Click a test button above.</p>
          ) : (
            debugInfo.map((info, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded">
                {info}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter a valid slide ID in the input above</li>
          <li>Click "Test URL Parsing" to verify URL parsing works</li>
          <li>Click "Test API Call" to verify the API endpoint works</li>
          <li>Click "Test Current URL" to see how the current page URL is parsed</li>
          <li>Check the debug output for any errors</li>
        </ol>
      </div>
    </div>
  )
}
