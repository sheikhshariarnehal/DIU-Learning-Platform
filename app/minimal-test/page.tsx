"use client"

import { useState } from "react"

export default function MinimalTestPage() {
  const [message, setMessage] = useState("Click the button to test functionality")

  const testBasicFunctionality = () => {
    try {
      // Test basic URL generation
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const testUrl = `${baseUrl}/video/test-123`
      
      // Test URL update
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', testUrl)
      }
      
      setMessage(`✅ Success! URL updated to: ${testUrl}`)
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    }
  }

  const testCopyToClipboard = async () => {
    try {
      const testUrl = `${window.location.origin}/video/test-copy-123`
      await navigator.clipboard.writeText(testUrl)
      setMessage(`✅ Copied to clipboard: ${testUrl}`)
    } catch (error) {
      setMessage(`❌ Copy failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Minimal Functionality Test</h1>
      
      <div className="space-y-4">
        <p className="text-lg">{message}</p>
        
        <div className="space-x-4">
          <button 
            onClick={testBasicFunctionality}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test URL Update
          </button>
          
          <button 
            onClick={testCopyToClipboard}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Copy to Clipboard
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Current URL:</h3>
          <p className="text-sm font-mono">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}
