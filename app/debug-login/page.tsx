"use client"

import { useState } from "react"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("admin@diu.edu.bd")
  const [password, setPassword] = useState("admin123")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testLogin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      })
    } catch (error) {
      setResult({
        error: error.message
      })
    }

    setIsLoading(false)
  }

  const testAuthMe = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data,
        endpoint: "/api/auth/me"
      })
    } catch (error) {
      setResult({
        error: error.message,
        endpoint: "/api/auth/me"
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Login</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testLogin}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Debug Login"}
          </button>
          
          <button
            onClick={testAuthMe}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Test Auth Me"}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
