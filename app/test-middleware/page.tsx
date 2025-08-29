"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function TestMiddlewarePage() {
  const [urlInfo, setUrlInfo] = useState<any>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setUrlInfo({
        currentUrl: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        sharePath: urlParams.get('share_path'),
        allParams: Object.fromEntries(urlParams.entries())
      })
    }
  }, [])

  const testShareableUrls = [
    'http://localhost:3000/slide/13e67327-db36-410a-b560-f45618d38929',
    'http://localhost:3000/video/test-video-123',
    'http://localhost:3000/study-tool/test-study-456'
  ]

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Test Middleware</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Current URL Info:</h2>
          <pre className="text-sm">{JSON.stringify(urlInfo, null, 2)}</pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Shareable URLs:</h2>
          <div className="space-y-2">
            {testShareableUrls.map((url, index) => (
              <div key={index}>
                <a 
                  href={url}
                  className="text-blue-600 hover:underline block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click on one of the shareable URLs above</li>
            <li>It should open the main page (not show 404)</li>
            <li>Check if the share_path parameter is present</li>
            <li>The content should load automatically</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
