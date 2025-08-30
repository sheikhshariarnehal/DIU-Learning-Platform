"use client"

import { useState } from "react"

export default function SimpleLoginPage() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testLogin = async () => {
    setIsLoading(true)
    setResult("Testing login...")

    try {
      console.log("🔍 Starting simple login test...")
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          email: "admin@diu.edu.bd", 
          password: "admin123" 
        }),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Response data:", data)

      if (data.success) {
        setResult("✅ Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/admin"
        }, 1000)
      } else {
        setResult("❌ Login failed: " + data.error)
      }

    } catch (error) {
      console.error("❌ Login error:", error)
      setResult("❌ Error: " + error.message)
    }

    setIsLoading(false)
  }

  const testServer = async () => {
    setIsLoading(true)
    setResult("Testing server...")

    try {
      const response = await fetch("/api/test-cookies")
      const data = await response.json()
      setResult("✅ Server responding: " + JSON.stringify(data, null, 2))
    } catch (error) {
      setResult("❌ Server error: " + error.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Login Test</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testServer}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          {isLoading ? "Testing..." : "Test Server"}
        </button>
        
        <button
          onClick={testLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Login"}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Result:</h2>
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Credentials being tested:</strong></p>
        <p>Email: admin@diu.edu.bd</p>
        <p>Password: admin123</p>
      </div>
    </div>
  )
}
