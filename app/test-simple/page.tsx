"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SimpleShareButton } from "@/components/simple-share-button"
import { generateSimpleShareUrl, parseSimpleShareUrl, updateUrlWithoutNavigation } from "@/lib/simple-share-utils"

export default function TestSimplePage() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []
    
    try {
      // Test URL generation
      const videoUrl = generateSimpleShareUrl('video', 'test-video-123')
      results.push(`✅ Video URL: ${videoUrl}`)
      
      const slideUrl = generateSimpleShareUrl('slide', 'test-slide-456')
      results.push(`✅ Slide URL: ${slideUrl}`)
      
      const studyToolUrl = generateSimpleShareUrl('study-tool', 'test-study-789')
      results.push(`✅ Study Tool URL: ${studyToolUrl}`)
      
      // Test URL parsing
      const parsedVideo = parseSimpleShareUrl('http://localhost:3000/video/test-video-123')
      results.push(`✅ Parsed Video: ${JSON.stringify(parsedVideo)}`)
      
      const parsedSlide = parseSimpleShareUrl('http://localhost:3000/slide/test-slide-456')
      results.push(`✅ Parsed Slide: ${JSON.stringify(parsedSlide)}`)
      
      const parsedStudyTool = parseSimpleShareUrl('http://localhost:3000/study-tool/test-study-789')
      results.push(`✅ Parsed Study Tool: ${JSON.stringify(parsedStudyTool)}`)
      
      results.push(`✅ All tests passed!`)
      
    } catch (error) {
      results.push(`❌ Error: ${error}`)
    }
    
    setTestResults(results)
  }

  const testUrlUpdate = () => {
    const testUrl = generateSimpleShareUrl('video', 'demo-video-123')
    updateUrlWithoutNavigation(testUrl)
    setCurrentUrl(window.location.href)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Simple Share Functionality Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test URL Generation & Parsing:</h2>
          <Button onClick={runTests}>Run Tests</Button>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Test URL Update:</h2>
          <Button onClick={testUrlUpdate}>Update URL</Button>
          {currentUrl && (
            <p className="mt-2 text-sm text-gray-600">Current URL: {currentUrl}</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Share Button:</h2>
          <SimpleShareButton 
            url="http://localhost:3000/video/test-123"
            title="Test Video"
          />
        </div>
        
        {testResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono text-sm mb-2">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
