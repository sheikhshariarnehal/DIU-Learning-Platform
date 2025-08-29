"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { parseSimpleShareUrl } from "@/lib/simple-share-utils"

export default function DebugUrlPage() {
  const [urlInfo, setUrlInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setUrlInfo({
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        sharePath: urlParams.get('share_path'),
        allParams: Object.fromEntries(urlParams.entries())
      })
    }
  }, [])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testUrlParsing = () => {
    const testUrls = [
      window.location.href,
      'http://localhost:3000/slide/13e67327-db36-410a-b560-f45618d38929',
      'http://localhost:3000/video/test-video-123',
      'http://localhost:3000/study-tool/test-study-456'
    ]

    testUrls.forEach(url => {
      const parsed = parseSimpleShareUrl(url)
      addResult(`URL: ${url} -> Parsed: ${JSON.stringify(parsed)}`)
    })
  }

  const testApiCall = async () => {
    try {
      addResult("Testing API call...")
      const response = await fetch('/api/slides-list')
      const data = await response.json()
      addResult(`API Response: ${response.status} - ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      addResult(`API Error: ${error}`)
    }
  }

  const simulateShareableUrl = () => {
    const testUrl = 'http://localhost:3000/slide/test-slide-123'
    addResult(`Simulating visit to: ${testUrl}`)
    window.history.pushState(null, '', testUrl)
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug URL Processing</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Current URL Info:</h2>
          <pre className="text-sm overflow-x-auto">{JSON.stringify(urlInfo, null, 2)}</pre>
        </div>
        
        <div className="space-x-2">
          <Button onClick={testUrlParsing}>Test URL Parsing</Button>
          <Button onClick={testApiCall}>Test API</Button>
          <Button onClick={simulateShareableUrl}>Simulate Shareable URL</Button>
          <Button onClick={() => setTestResults([])} variant="outline">Clear</Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test Results:</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet.</p>
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
          <h3 className="font-semibold mb-2">Debug Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check current URL info above</li>
            <li>Test URL parsing to see if shareable URLs are detected</li>
            <li>Test API to see if backend is working</li>
            <li>Check browser console for additional logs</li>
            <li>Try simulating a shareable URL visit</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
