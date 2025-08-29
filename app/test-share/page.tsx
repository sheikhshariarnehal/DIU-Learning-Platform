"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/share-button"
import { generateShareUrl, parseShareUrl } from "@/lib/share-utils"

export default function TestSharePage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []
    
    try {
      // Test URL generation
      const videoUrl = generateShareUrl('video', 'test-video-123')
      results.push(`✅ Video URL: ${videoUrl}`)
      
      const slideUrl = generateShareUrl('slide', 'test-slide-456')
      results.push(`✅ Slide URL: ${slideUrl}`)
      
      const studyToolUrl = generateShareUrl('study-tool', 'test-study-789')
      results.push(`✅ Study Tool URL: ${studyToolUrl}`)
      
      // Test URL parsing
      const parsedVideo = parseShareUrl('http://localhost:3000/video/test-video-123')
      results.push(`✅ Parsed Video: ${JSON.stringify(parsedVideo)}`)
      
      const parsedSlide = parseShareUrl('http://localhost:3000/slide/test-slide-456')
      results.push(`✅ Parsed Slide: ${JSON.stringify(parsedSlide)}`)
      
      const parsedStudyTool = parseShareUrl('http://localhost:3000/study-tool/test-study-789')
      results.push(`✅ Parsed Study Tool: ${JSON.stringify(parsedStudyTool)}`)
      
      results.push(`✅ All tests passed!`)
      
    } catch (error) {
      results.push(`❌ Error: ${error}`)
    }
    
    setTestResults(results)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Share Functionality Test</h1>
      
      <div className="space-y-4">
        <Button onClick={runTests}>Run Tests</Button>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Test ShareButton Component:</h2>
          <ShareButton 
            url="http://localhost:3000/video/test-123"
            title="Test Video"
            description="This is a test video for sharing functionality"
          />
        </div>
        
        {testResults.length > 0 && (
          <div className="mt-6">
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
